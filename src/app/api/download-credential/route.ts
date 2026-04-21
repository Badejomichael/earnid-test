import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const credentialId = searchParams.get("id");
  


  if (!credentialId) {
    return NextResponse.json({ error: "Missing credential ID" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: credential, error } = await supabase
    .from("credentials")
    .select("*")
    .eq("id", credentialId)
    .eq("is_public", true)
    .single();

  if (error || !credential) {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, profession")
    .eq("id", credential.user_id)
    .single();

  const name = profile?.full_name ?? "EarnID User";
  const profession = profile?.profession ?? "";
  const score = credential.consistency_score;
  const total = credential.total_earned.toLocaleString();
  const avg = Math.round(credential.monthly_average).toLocaleString();
  const since = new Date(credential.active_since).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const mintAddr = credential.mint_address
    ? `${credential.mint_address.slice(0, 14)}...${credential.mint_address.slice(-8)}`
    : "Solana Devnet";
  const minted = new Date(credential.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const verifyUrl = `${req.nextUrl.origin}/verify/${credential.id}`;
  const circ = (2 * Math.PI * 44).toFixed(2);
  const offset = (2 * Math.PI * 44 * (1 - score / 100)).toFixed(2);
  const safeName = name.replace(/[^a-zA-Z0-9]/g, "-");

  const sourceTags = (credential.top_sources as string[])
    .map((s) => `<span style="display:inline-block;font-size:10px;letter-spacing:0.06em;border:1px solid #252525;color:#666;padding:4px 12px;border-radius:50px;font-family:monospace;margin:0 4px 4px 0;">${s}</span>`)
    .join("");

  const qrSquares = [[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[4,0],[4,1],[4,2],[5,1],[7,0],[8,0],[9,0],[7,1],[9,1],[7,2],[8,2],[9,2],[0,4],[1,4],[3,4],[5,4],[6,4],[8,4],[9,4],[0,5],[2,5],[4,5],[6,5],[8,5],[0,6],[2,6],[3,6],[5,6],[7,6],[9,6],[0,7],[1,7],[2,7],[4,7],[6,7],[8,7],[9,7],[0,8],[3,8],[5,8],[7,8],[0,9],[1,9],[2,9],[4,9],[5,9],[7,9],[9,9]]
    .map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1" fill="black"/>`)
    .join("");

    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 80, margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
    });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>EarnID — ${name}</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{
    background:#080808;
    display:flex;
    align-items:center;
    justify-content:center;
    min-height:100vh;
    font-family:'DM Sans',sans-serif;
  }
  #card{
    width:680px;
    background:linear-gradient(155deg,#131313 0%,#0a0a0a 100%);
    border:1px solid #1f1f1f;
    border-radius:18px;
    padding:28px 32px 24px;
    position:relative;
    overflow:hidden;
    color:white;
  }
  .glow-tr{position:absolute;top:0;right:0;width:220px;height:220px;background:radial-gradient(circle at top right,rgba(200,241,53,0.10),transparent 65%);pointer-events:none;}
  .glow-bl{position:absolute;bottom:0;left:0;width:160px;height:160px;background:radial-gradient(circle at bottom left,rgba(200,241,53,0.04),transparent 65%);pointer-events:none;}
  .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
  .logo{display:flex;align-items:center;gap:9px;}
  .logo-dot{width:26px;height:26px;border-radius:50%;background:#C8F135;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:11px;color:#000;font-family:'Syne',sans-serif;}
  .logo-name{font-family:'Syne',sans-serif;font-weight:800;font-size:14px;color:white;}
  .badge{font-size:8.5px;letter-spacing:0.25em;color:#C8F135;border:1px solid rgba(200,241,53,0.3);padding:5px 13px;border-radius:50px;font-family:monospace;}
  .divider{height:1px;background:#1a1a1a;margin:14px 0;}
  .cred-label{font-size:7.5px;letter-spacing:0.22em;color:#2a2a2a;text-transform:uppercase;margin-bottom:4px;}
  .name{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:white;margin-bottom:3px;line-height:1.1;}
  .profession{font-size:11px;color:#555;margin-bottom:16px;}
  .main-row{display:flex;align-items:center;gap:22px;margin-bottom:14px;}
  .ring-wrap{position:relative;width:100px;height:100px;flex-shrink:0;}
  .ring-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
  .ring-score{font-family:'Syne',sans-serif;font-size:28px;font-weight:900;color:white;line-height:1;}
  .ring-label{font-size:7px;color:#444;letter-spacing:0.2em;text-transform:uppercase;margin-top:2px;}
  .stats{display:flex;gap:22px;flex:1;}
  .stat-lbl{font-size:7px;letter-spacing:0.18em;color:#333;text-transform:uppercase;margin-bottom:3px;}
  .stat-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:white;line-height:1.1;}
  .stat-sub{font-size:12px;color:#666;}
  .sources{display:flex;flex-wrap:wrap;margin-bottom:14px;}
  .footer-divider{height:1px;background:#161616;margin-bottom:13px;}
  .footer{display:flex;align-items:center;justify-content:space-between;}
  .chain-label{font-size:7px;letter-spacing:0.2em;color:#1e1e1e;text-transform:uppercase;margin-bottom:3px;}
  .chain-val{font-family:monospace;font-size:9.5px;color:#3a3a3a;margin-bottom:2px;}
  .verify-url{font-family:monospace;font-size:8.5px;color:#2a2a2a;}
  .meta-right{text-align:right;}
  .qr-box{width:46px;height:46px;background:white;border-radius:5px;padding:4px;flex-shrink:0;}
  #status{
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(8,8,8,0.95);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    color:white;font-family:'DM Sans',sans-serif;
    z-index:999;
  }
  .spinner{
    width:36px;height:36px;
    border:3px solid #1a1a1a;
    border-top:3px solid #C8F135;
    border-radius:50%;
    animation:spin 1s linear infinite;
    margin-bottom:16px;
  }
  @keyframes spin{to{transform:rotate(360deg);}}
  .status-text{font-size:13px;color:#555;letter-spacing:0.1em;}
  .status-label{font-size:11px;color:#C8F135;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px;}
</style>
</head>
<body>

<!-- Loading overlay -->
<div id="status">
  <div class="spinner"></div>
  <div class="status-label">Generating PDF</div>
  <div class="status-text">Preparing your credential...</div>
</div>

<!-- The card to capture -->
<div id="card">
  <div class="glow-tr"></div>
  <div class="glow-bl"></div>

  <div class="header">
    <div class="logo">
      <div class="logo-dot">E</div>
      <span class="logo-name">EarnID</span>
    </div>
    <span class="badge">VERIFIED</span>
  </div>

  <div class="divider"></div>

  <div class="cred-label">Income Credential</div>
  <div class="name">${name}</div>
  <div class="profession">${profession} · Nigeria</div>

  <div class="main-row">
    <div class="ring-wrap">
      <svg width="100" height="100" viewBox="0 0 100 100" style="position:absolute;top:0;left:0;">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#111" stroke-width="7" transform="rotate(-90 50 50)"/>
        <circle cx="50" cy="50" r="44" fill="none" stroke="#C8F135" stroke-width="7"
          stroke-linecap="round"
          stroke-dasharray="${circ}"
          stroke-dashoffset="${offset}"
          transform="rotate(-90 50 50)"/>
      </svg>
      <div class="ring-inner">
        <span class="ring-score">${score}</span>
        <span class="ring-label">SCORE</span>
      </div>
    </div>
    <div class="stats">
      <div>
        <div class="stat-lbl">Total Verified</div>
        <div class="stat-val">$${total}</div>
      </div>
      <div>
        <div class="stat-lbl">Avg / Month</div>
        <div class="stat-sub">$${avg}</div>
      </div>
      <div>
        <div class="stat-lbl">Active Since</div>
        <div class="stat-sub">${since}</div>
      </div>
    </div>
  </div>

  <div class="sources">${sourceTags}</div>

  <div class="footer-divider"></div>
  <div class="footer">
    <div>
      <div class="chain-label">On-chain proof</div>
      <div class="chain-val">SOL · ${mintAddr}</div>
      <div class="verify-url">${verifyUrl}</div>
    </div>
    <img src="${qrDataUrl}" style="width:44px;height:44px;border-radius:5px;" />
    <div class="meta-right">
      <div class="chain-label">Minted · ${minted}</div>
      <div class="chain-val">Solana Devnet</div>
    </div>
  </div>
</div>

<script>
window.addEventListener('load', function() {
  // Wait for Google Fonts
  document.fonts.ready.then(function() {
    setTimeout(function() {
      var card = document.getElementById('card');
      var status = document.getElementById('status');

      html2canvas(card, {
        backgroundColor: '#080808',
        scale: 2,
        useCORS: true,
        logging: false,
        width: 680,
        height: card.offsetHeight,
      }).then(function(canvas) {
        var imgData = canvas.toDataURL('image/png');
        var cardW = 680;
        var cardH = card.offsetHeight;
        var pdfW = cardW * 0.75;
        var pdfH = cardH * 0.75;

        var pdf = new window.jspdf.jsPDF({
          orientation: pdfW > pdfH ? 'landscape' : 'portrait',
          unit: 'pt',
          format: [pdfW, pdfH]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
        pdf.save('EarnID-Credential-${safeName}.pdf');

        // Done — close window
        setTimeout(function() { window.close(); }, 500);
      }).catch(function(err) {
        status.innerHTML = '<div style="color:#ef4444;font-size:13px;">Failed to generate PDF.<br/>Please try again.</div>';
        console.error(err);
      });
    }, 800);
  });
});
</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}