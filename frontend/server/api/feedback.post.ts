import nodemailer from 'nodemailer';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { pseudo,mail, message, type } = body;

   
    try {
         const transported = nodemailer.createTransport({
        service : 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    await transported.sendMail({
        from : `"Kaki Cube Battle <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `Un retour ${type} a été envoyé par ${pseudo.length > 0 ? pseudo : "un anonyme"} !`,
        text : `${message} \n ${mail.length > 0 ? 'Adresse mail de réponse: ' + mail : 'sans mail renseigné'}` ,
    });
    }catch(e : any) {
        throw createError({statusCode : 500, statusMessage : 'Une erreur serveur est survenue lors de l\'envoi du mail. Votre retour n\'a pas été pris en compte (oui c\'est un comble).'})
    }
   

    return  { success : true };
})