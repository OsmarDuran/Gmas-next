// scripts/crear-datos-prueba.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 1. Crear puesto
    let puesto = await prisma.puesto.findFirst({
        where: { nombre: 'Desarrollador' }
    });

    if (!puesto) {
        puesto = await prisma.puesto.create({
            data: {
                nombre: 'Desarrollador',
                notas: 'Puesto de prueba',
            },
        });
    }

    console.log('Puesto creado:', puesto);

    // 2. Crear un usuario admin que será líder de sí mismo
    const hashPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.usuario.create({
        data: {
            nombre: 'Admin',
            apellidoPaterno: 'Sistema',
            email: 'admin@grupomasagua.com',
            puestoId: puesto.id,
            centroId: 1, // Oficinas Centrales del seed
            rolId: 3, // master
            liderId: 1, // Se referencia a sí mismo (lo crearemos después)
            hashPassword: hashPassword,
            activo: true,
        },
    });

    // Actualizar para que sea líder de sí mismo
    await prisma.usuario.update({
        where: { id: admin.id },
        data: { liderId: admin.id },
    });

    console.log('Admin creado:', admin);

    // 3. Crear un usuario empleado
    const hashPassword2 = await bcrypt.hash('empleado123', 10);

    const empleado = await prisma.usuario.create({
        data: {
            nombre: 'Juan',
            apellidoPaterno: 'Pérez',
            apellidoMaterno: 'López',
            email: 'juan.perez@grupomasagua.com',
            telefono: '2291234567',
            puestoId: puesto.id,
            centroId: 1,
            rolId: 2, // employee
            liderId: admin.id,
            hashPassword: hashPassword2,
            activo: true,
        },
    });

    console.log('Empleado creado:', empleado);

    console.log('\n✅ Datos de prueba creados exitosamente!');
    console.log(`\nPuedes crear una asignación con:`);
    console.log(`  - Equipo ID: 1`);
    console.log(`  - Usuario ID: ${empleado.id}`);
    console.log(`  - Asignado por: ${admin.id}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
