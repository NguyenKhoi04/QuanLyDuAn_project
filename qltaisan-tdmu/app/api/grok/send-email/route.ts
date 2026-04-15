// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to, content, type, subject } = await request.json();

    if (!to || !content) {
      return NextResponse.json(
        { error: 'Thiếu thông tin email' },
        { status: 400 }
      );
    }

    const emailSubject = subject || getDefaultSubject(type);

    const { data, error } = await resend.emails.send({
      from: 'Quản Lý Tài Sản <no-reply@qltaisan-tdmu.com>', // Thay domain của bạn
      to: to,
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #1f2937;">Thông báo từ Hệ thống Quản lý Tài sản</h2>
          <p style="font-size: 16px; line-height: 1.6;">${content}</p>
          
          <hr style="margin: 20px 0;" />
          
          <p style="color: #6b7280; font-size: 14px;">
            Đây là email tự động từ hệ thống.<br>
            Vui lòng không trả lời email này.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email đã được gửi thành công',
      data 
    });

  } catch (error: any) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi gửi email' }, 
      { status: 500 }
    );
  }
}

function getDefaultSubject(type: string): string {
  switch (type) {
    case 'maintenance':
      return '🛠️ Nhắc nhở Bảo trì Tài sản';
    case 'incident':
      return '🚨 Báo động Sự cố Tài sản';
    case 'status':
      return '📊 Cập nhật Trạng thái Tài sản';
    default:
      return '📢 Thông báo từ Hệ thống Quản lý Tài sản';
  }
}