import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Automacao from '@/lib/models/Automacao';
import IP from '@/lib/models/IP';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

const ensureModelsRegistered = () => {
  if (!mongoose.models.IP) { require('@/lib/models/IP'); }
  if (!mongoose.models.Automacao) { require('@/lib/models/Automacao'); }
};

async function checkAuth(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  return payload;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkAuth(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    ensureModelsRegistered();

    const { id } = await params;
    const body = await request.json();

    const AutomacaoModel = mongoose.models.Automacao || Automacao;
    
    // Filter out empty strings for optional fields
    const updateBody: any = {
      ip: body.ip,
      equipamento: body.equipamento,
    };
    if (body.porta && body.porta !== '') { updateBody.porta = body.porta; } else { updateBody.porta = undefined; }
    if (body.categoria && body.categoria !== '') { updateBody.categoria = body.categoria; } else { updateBody.categoria = undefined; }
    if (body.faixa && body.faixa !== '') { updateBody.faixa = body.faixa; } else { updateBody.faixa = undefined; }

    const automacaoRaw = await AutomacaoModel.findByIdAndUpdate(
      id,
      updateBody,
      { new: true, runValidators: true }
    )
      .populate({ path: 'faixa', model: 'IP', strictPopulate: false })
      .lean();

    if (!automacaoRaw) {
      return NextResponse.json(
        { error: 'Automacao not found' },
        { status: 404 }
      );
    }

    // Serialize automacao
    const automacao = {
      _id: automacaoRaw._id.toString(),
      ip: automacaoRaw.ip || '',
      equipamento: automacaoRaw.equipamento || '',
      porta: automacaoRaw.porta || undefined,
      categoria: automacaoRaw.categoria || undefined,
      faixa: automacaoRaw.faixa ? {
        _id: automacaoRaw.faixa._id?.toString() || '',
        tipo: automacaoRaw.faixa.tipo || 'faixa',
        nome: automacaoRaw.faixa.nome || '',
        faixa: automacaoRaw.faixa.faixa || undefined,
        vlanNome: automacaoRaw.faixa.vlanNome || undefined,
        vlanId: automacaoRaw.faixa.vlanId || undefined,
      } : undefined,
      createdAt: automacaoRaw.createdAt ? new Date(automacaoRaw.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: automacaoRaw.updatedAt ? new Date(automacaoRaw.updatedAt).toISOString() : new Date().toISOString(),
    };

    return NextResponse.json({ automacao });
  } catch (error) {
    console.error('Error updating automacao:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkAuth(request);
    
    if (!auth || (auth as any).nivelAcesso !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const automacao = await Automacao.findByIdAndDelete(id);

    if (!automacao) {
      return NextResponse.json(
        { error: 'Automacao not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Automacao deleted successfully' });
  } catch (error) {
    console.error('Error deleting automacao:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

