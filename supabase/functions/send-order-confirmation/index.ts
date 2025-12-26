import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  email: string;
  phone: string;
  deliveryAddress: string;
  billingAddress: string;
  productName: string;
  quantity: number;
  totalAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      phone, 
      deliveryAddress, 
      billingAddress, 
      productName, 
      quantity, 
      totalAmount 
    }: OrderConfirmationRequest = await req.json();

    console.log("Sending order confirmation email to:", email);
    console.log("Order details:", { productName, quantity, totalAmount });

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Elegance Jewelry <onboarding@resend.dev>",
        to: [email],
        subject: "Thank you for your order! - Elegance Jewelry",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Georgia', serif; background-color: #faf9f6; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
              .header { background: linear-gradient(135deg, #d4af37, #f4e4bc); padding: 30px; text-align: center; }
              .header h1 { color: #2d2d2d; margin: 0; font-size: 28px; }
              .content { padding: 30px; }
              .order-details { background-color: #faf9f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { background-color: #2d2d2d; color: #faf9f6; padding: 20px; text-align: center; }
              .highlight { color: #d4af37; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✨ Elegance Jewelry ✨</h1>
                <p style="color: #5a5a5a; margin-top: 10px;">Thank you for your purchase!</p>
              </div>
              <div class="content">
                <p>Dear Valued Customer,</p>
                <p>Thank you for choosing Elegance Jewelry! We're thrilled to confirm your order.</p>
                
                <div class="order-details">
                  <h3 style="margin-top: 0; color: #2d2d2d;">Order Summary</h3>
                  <p><strong>Product:</strong> ${productName}</p>
                  <p><strong>Quantity:</strong> ${quantity}</p>
                  <p><strong>Total Amount:</strong> <span class="highlight">₹${totalAmount.toLocaleString()}</span></p>
                </div>
                
                <div class="order-details">
                  <h3 style="margin-top: 0; color: #2d2d2d;">Delivery Information</h3>
                  <p><strong>Delivery Address:</strong><br/>${deliveryAddress}</p>
                  <p><strong>Billing Address:</strong><br/>${billingAddress}</p>
                  <p><strong>Contact:</strong> ${phone}</p>
                </div>
                
                <div class="order-details" style="border-left: 3px solid #d4af37;">
                  <h3 style="margin-top: 0; color: #2d2d2d;">📦 Delivery Information</h3>
                  <p><strong>Within Jaffna:</strong> One-day delivery available!</p>
                  <p><strong>Other locations:</strong> 3-5 business days</p>
                </div>
                
                <p>If you have any questions about your order, please don't hesitate to contact us.</p>
                <p>With warm regards,<br/><strong>The Elegance Jewelry Team</strong></p>
              </div>
              <div class="footer">
                <p>Elegance Jewelry - Crafting Timeless Beauty</p>
                <p style="font-size: 12px;">123 Jewelry Lane, Diamond District</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const data = await emailResponse.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
