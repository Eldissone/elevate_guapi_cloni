// seed-admin.ts
import 'dotenv/config';
import connectDB from './lib/db.ts';
import User, { IUser } from './lib/models/User.ts';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  try {
    await connectDB();
    console.log('MongoDB conectado ✅');

    const adminUsername = 'admin';
    const adminPassword = 'admin123'; // troca depois por senha forte
    const adminFullName = 'Administrador';

    // Verifica se o admin já existe
    const existingAdmin = await User.findOne({ username: adminUsername.toLowerCase() });
    if (existingAdmin) {
      console.log('Usuário admin já existe:', existingAdmin.username);
      process.exit(0);
    }

    // Hash da senha
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    const newAdmin: Partial<IUser> = {
      username: adminUsername.toLowerCase(),
      password: hashedPassword,
      fullName: adminFullName,
      funcao: 'Administrador',
      isAdmin: true,
      nivelAcesso: 'admin',
    };

    const createdAdmin = await User.create(newAdmin);
    console.log('Usuário admin criado com sucesso ✅');
    console.log('Detalhes:', {
      username: createdAdmin.username,
      fullName: createdAdmin.fullName,
      isAdmin: createdAdmin.isAdmin,
      nivelAcesso: createdAdmin.nivelAcesso,
    });

    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar admin ❌', error);
    process.exit(1);
  }
}

seedAdmin();
