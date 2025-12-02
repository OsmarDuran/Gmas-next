import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { Usuario, Puesto, Centro, Equipo, TipoEquipo, Modelo, Marca, EquipoSim, EquipoConsumible, Color } from '@prisma/client';

// Tipos necesarios para los datos
type UsuarioCompleto = Usuario & {
    puesto: Puesto | null;
    centro: Centro | null;
};

type EquipoCompleto = Equipo & {
    tipo: TipoEquipo;
    modelo: (Modelo & {
        marcaTipo: {
            marca: Marca;
        }
    }) | null;
    sim: EquipoSim | null;
    consumible: (EquipoConsumible & { color: Color }) | null;
};

/**
 * Genera un PDF de asignación masiva de equipos (Resguardo Único)
 * @param usuario - Usuario que recibe los equipos
 * @param equipos - Lista de equipos asignados
 * @param encargado - Usuario que realiza la asignación (opcional por ahora)
 * @returns Ruta relativa del PDF generado
 */
export async function generarPdfAsignacion(
    usuario: UsuarioCompleto,
    equipos: EquipoCompleto[],
    encargado?: Usuario
): Promise<string> {
    const pdfDir = path.join(process.cwd(), 'public', 'pdfs', 'asignaciones');
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
    }

    const fecha = new Date().toISOString().split('T')[0];
    const filename = `resguardo-${usuario.id}-${fecha}-${Date.now()}.pdf`;
    const filepath = path.join(pdfDir, filename);

    const fontRegular = 'C:\\Windows\\Fonts\\arial.ttf';
    const fontBold = 'C:\\Windows\\Fonts\\arialbd.ttf';

    const doc = new PDFDocument({
        margin: 50,
        size: 'LETTER',
        font: fontRegular,
    });

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // ==================== CONTENIDO ====================

    // Encabezado
    doc.fontSize(20).font(fontBold).text('GRUPO MAS', { align: 'center' }).moveDown(0.3);
    doc.fontSize(16).font(fontRegular).text('ACTA DE RESGUARDO DE EQUIPOS', { align: 'center' }).moveDown(1.5);

    // Datos Usuario
    doc.fontSize(12).font(fontBold).text('DATOS DEL EMPLEADO', { underline: true }).moveDown(0.5);

    const nombreCompleto = [usuario.nombre, usuario.apellidoPaterno, usuario.apellidoMaterno].filter(Boolean).join(' ');

    doc.fontSize(10).font(fontRegular);
    doc.text(`Nombre: ${nombreCompleto}`);
    doc.text(`Puesto: ${usuario.puesto?.nombre || 'N/A'}`);
    doc.text(`Centro de Costos: ${usuario.centro?.nombre || 'N/A'}`);
    doc.text(`Email: ${usuario.email}`);
    doc.moveDown(1.5);

    // Tabla de Equipos
    doc.fontSize(12).font(fontBold).text('EQUIPOS ASIGNADOS', { underline: true }).moveDown(0.5);

    const tableTop = doc.y;
    const colX = [50, 150, 300, 450]; // Posiciones X de columnas

    // Encabezados tabla
    doc.fontSize(9).font(fontBold);
    doc.text('TIPO', colX[0], tableTop);
    doc.text('MARCA / MODELO', colX[1], tableTop);
    doc.text('SERIE / IDENTIFICADOR', colX[2], tableTop);
    doc.text('DETALLES', colX[3], tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(562, tableTop + 15).stroke();

    let y = tableTop + 25;
    doc.font(fontRegular);

    equipos.forEach((eq) => {
        if (y > 700) { // Nueva página si se llena
            doc.addPage();
            y = 50;
        }

        const tipo = eq.tipo.nombre;
        const marcaModelo = eq.modelo
            ? `${eq.modelo.marcaTipo.marca.nombre} - ${eq.modelo.nombre}`
            : 'Genérico';

        let identificador = eq.numeroSerie || 'S/N';
        let detalles = '';

        if (eq.sim) {
            identificador = `Tel: ${eq.sim.numeroAsignado}`;
            detalles = `IMEI: ${eq.sim.imei}`;
        } else if (eq.consumible) {
            detalles = `Color: ${eq.consumible.color.nombre}`;
        }

        doc.text(tipo, colX[0], y, { width: 90 });
        doc.text(marcaModelo, colX[1], y, { width: 140 });
        doc.text(identificador, colX[2], y, { width: 140 });
        doc.text(detalles, colX[3], y, { width: 100 });

        y += 30; // Espacio por fila
    });

    doc.moveDown(2);
    doc.y = y + 20;

    // Declaración
    doc.fontSize(10).text(
        'Por medio de la presente recibo los equipos descritos anteriormente, comprometiéndome a cuidarlos y utilizarlos exclusivamente para el desempeño de mis funciones laborales.',
        { align: 'justify' }
    );
    doc.moveDown(4);

    // Firmas
    const firmaY = doc.y;

    // Firma Empleado
    doc.moveTo(80, firmaY).lineTo(280, firmaY).stroke();
    doc.text('FIRMA DEL EMPLEADO', 80, firmaY + 10, { width: 200, align: 'center' });
    doc.fontSize(8).text(nombreCompleto, 80, firmaY + 25, { width: 200, align: 'center' });

    // Firma Encargado (si existe)
    if (encargado) {
        doc.moveTo(330, firmaY).lineTo(530, firmaY).stroke();
        doc.text('ENTREGADO POR', 330, firmaY + 10, { width: 200, align: 'center' });
        const nombreEncargado = [encargado.nombre, encargado.apellidoPaterno].filter(Boolean).join(' ');
        doc.fontSize(8).text(nombreEncargado, 330, firmaY + 25, { width: 200, align: 'center' });
    }

    doc.end();

    await new Promise<void>((resolve) => stream.on('finish', () => resolve()));
    return `/pdfs/asignaciones/${filename}`;
}
