import assert from 'assert';
import crypto from 'crypto';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayProxyEventWithUserContextV2 } from './user-context';
import getDB from '../data';
import { ObjectId } from 'mongodb';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import URLSafeBase64 from 'urlsafe-base64';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const ConfirmEmailText = `Finish Setting Up SWRDL Account Recovery
-------------------------------------------------------
You're receiving this email because you set up account recovery for SWRDL.

You need to confirm your email address to finish.

Click this link to confirm:

%CONFIRM_LINK%

If you don't confirm your email address within 30 minutes, this link will expire.
You will not be able to recover your account if it is lost. We highly recommend
you confirm your e-mail so if you ever reinstall the app or switch devices you
don't lose all your games and data.

As part of our commitment to privacy, SWRDL does not store your email address and
cannot contact you unless specifically requested.

Questions or concerns? Reach out to us at hello@swrdl.com or reply to this email.`;

const ConfirmEmailHtml = `<!doctype html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><title></title><!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]--><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">#outlook a { padding:0; }
body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
p { display:block;margin:13px 0; }</style><!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]--><!--[if lte mso 11]>
<style type="text/css">
.mj-outlook-group-fix { width:100% !important; }
</style>
<![endif]--><!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css"><style type="text/css">@import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);</style><!--<![endif]--><style type="text/css">@media only screen and (min-width:480px) {
.mj-column-per-100 { width:100% !important; max-width: 100%; }
}</style><style media="screen and (min-width:480px)">.moz-text-html .mj-column-per-100 { width:100% !important; max-width: 100%; }</style><style type="text/css">@media only screen and (max-width:480px) {
table.mj-full-width-mobile { width: 100% !important; }
td.mj-full-width-mobile { width: auto !important; }
}</style></head><body style="word-spacing:normal;"><div><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tbody><tr><td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;"><tbody><tr><td style="width:100px;"><img height="auto" src="https://swrdl.app/mark.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="100"></td></tr></tbody></table></td></tr><tr><td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;"><p style="border-top:solid 4px #AA02AD;font-size:1px;margin:0px auto;width:100%;"></p><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 4px #AA02AD;font-size:1px;margin:0px auto;width:550px;" role="presentation" width="550px" ><tr><td style="height:0;line-height:0;"> &nbsp;
</td></tr></table><![endif]--></td></tr><tr><td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"><div style="font-family:helvetica;font-size:18px;line-height:1;text-align:left;color:#000000;">Finish Setting Up</div></td></tr><tr><td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"><div style="font-family:helvetica;font-size:16px;line-height:1.5;text-align:left;color:#000000;">You're receiving this email because you set up account recovery for SWRDL.</div></td></tr><tr><td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"><div style="font-family:helvetica;font-size:16px;font-weight:bold;line-height:1.5;text-align:left;color:#000000;">You need to confirm your email address to finish.</div></td></tr><tr><td align="center" vertical-align="middle" style="font-size:0px;padding:10px 25px;padding-top:40px;padding-bottom:40px;word-break:break-word;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;width:280px;line-height:100%;"><tr><td align="center" bgcolor="#AA02AD" role="presentation" style="border:none;border-radius:3px;cursor:auto;mso-padding-alt:10px 25px;background:#AA02AD;" valign="middle"><a href="%CONFIRM_LINK%" style="display:inline-block;width:230px;background:#AA02AD;color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:17px;font-weight:bold;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:3px;" target="_blank">Confirm Email Address</a></td></tr></table></td></tr><tr><td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"><div style="font-family:helvetica;font-size:16px;line-height:1.5;text-align:left;color:#000000;">If you don't confirm your email address within 30 minutes, this link will expire. You will not be able to recover your account if it is lost. We <strong>highly recommend</strong> you confirm your e-mail so if you ever reinstall the app or switch devices you don't lose all your games and data.</div></td></tr><tr><td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"><div style="font-family:helvetica;font-size:16px;line-height:1.5;text-align:left;color:#000000;">As part of our commitment to privacy, SWRDL does not store your email address and cannot contact you unless specifically requested.</div></td></tr><tr><td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;"><div style="font-family:helvetica;font-size:14px;line-height:1.5;text-align:left;color:#000000;">Questions or concerns? Reach out to us at <a style="color: #AA02AD" href="mailto:hello@swrdl.com">hello@swrdl.com</a> or reply to this email.</div></td></tr><tr><td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;"><div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:16px;text-align:center;color:#445566;">&copy; SWRDL.app, All Rights Reserved.</div></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></div></body></html>`;

export const handler = async (event: APIGatewayProxyEventWithUserContextV2): Promise<APIGatewayProxyResultV2> => {
    const { userId } = event.requestContext.authorizer.lambda;
    const { emailAddress } = JSON.parse(event.body || '{}');

    try {
        assert(!!userId);
        assert(ObjectId.isValid(userId));
        assert(!!emailAddress);
        assert(typeof emailAddress === 'string');
    } catch {
        return { statusCode: 400 };
    }

    const db = await getDB();
    const user = await db.userGet(userId);

    if (!user) {
        return { statusCode: 404 };
    }

    const emailHash = crypto.createHash('sha256').update(`SWRDL|${emailAddress.toLowerCase()}`, 'utf-8').digest('hex');

    if (await db.userGetByEmailHash(emailHash)) {
        return { statusCode: 409, body: 'email_in_use' };
    }

    if (user.emailConfirmed) {
        return { statusCode: 409, body: 'recovery_already_setup' };
    }

    const id = user._id.toHexString();
    const iss = new Date().getTime();
    const exp = new Date().setTime(new Date().getTime() + 1000 * 60 * 30);
    const sig = crypto
        .createHmac('sha256', process.env.RECOVERY_TOKEN_SECRET || '')
        .update(`setup|${id}|${iss}|${exp}|${emailHash}`, 'utf-8')
        .digest('base64');
    const setupToken = URLSafeBase64.encode(Buffer.from(JSON.stringify({ id, iss, exp, emailHash, sig }), 'utf-8'));
    const setupLink = `https://${process.env.WWW_DOMAIN}/s/${setupToken}`;

    const msg: MailDataRequired = {
        to: emailAddress,
        from: { name: 'SWRDL', email: 'hello@swrdl.app' },
        subject: 'Finish setting up SWRDL recovery',
        text: ConfirmEmailText.replace('%CONFIRM_LINK%', setupLink),
        html: ConfirmEmailHtml.replace('%CONFIRM_LINK%', setupLink),
    };
    await sgMail.send(msg);

    return { statusCode: 204 };
};
