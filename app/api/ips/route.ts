import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import IP from '@/lib/models/IP';
import { verifyToken } from '@/lib/auth';

async function checkAuth(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  return payload;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const skip = (page - 1) * limit;

    const [ips, total] = await Promise.all([
      IP.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      IP.countDocuments({}),
    ]);

    return NextResponse.json({
      ips,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching IPs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let tipoIP: string = 'faixa';
  let nome: string = '';
  
  try {
    const auth = await checkAuth(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    tipoIP = body.tipo || 'faixa';
    nome = body.nome || '';
    const { faixa, gateway, network, mask, vlanNome, vlanId, vlanFaixa, vlanGateway, vlanNetwork, vlanMask } = body;

    console.log('Criando IP/VLAN:', { tipo: tipoIP, nome, faixa, gateway, network, mask });

    // Trim nome
    const nomeTrimmed = nome.trim();
    
    // Manual check for duplicates (since we removed unique index)
    const existingIP = await IP.findOne({ 
      tipo: tipoIP, 
      nome: nomeTrimmed 
    });
    
    if (existingIP) {
      return NextResponse.json(
        { error: `Esta ${tipoIP === 'faixa' ? 'faixa' : 'VLAN'} já está cadastrada com o nome "${nomeTrimmed}"` },
        { status: 400 }
      );
    }
    
    // Prepare data object - only include fields relevant to the tipo
    const ipData: any = {
      tipo: tipoIP,
      nome: nomeTrimmed,
      ativo: true,
    };

    if (tipoIP === 'faixa') {
      // Only include faixa fields
      ipData.faixa = faixa || undefined;
      ipData.gateway = gateway || undefined;
      ipData.network = network || undefined;
      ipData.mask = mask || undefined;
      // Clear VLAN fields
      ipData.vlanNome = undefined;
      ipData.vlanId = undefined;
      ipData.vlanFaixa = undefined;
      ipData.vlanGateway = undefined;
      ipData.vlanNetwork = undefined;
      ipData.vlanMask = undefined;
    } else if (tipoIP === 'vlan') {
      // Only include VLAN fields
      ipData.vlanNome = vlanNome || undefined;
      ipData.vlanId = vlanId || undefined;
      ipData.vlanFaixa = vlanFaixa || undefined;
      ipData.vlanGateway = vlanGateway || undefined;
      ipData.vlanNetwork = vlanNetwork || undefined;
      ipData.vlanMask = vlanMask || undefined;
      // Clear faixa fields
      ipData.faixa = undefined;
      ipData.gateway = undefined;
      ipData.network = undefined;
      ipData.mask = undefined;
    }

    console.log('Dados preparados para criação:', ipData);

    const ip = await IP.create(ipData);

    const ipPopulado = await IP.findById(ip._id);

    return NextResponse.json(
      { ip: ipPopulado },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating IP:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      errors: error.errors
    });
    

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      const errorMessage = errors.join(', ');
      console.error('Validation errors:', errors);
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
