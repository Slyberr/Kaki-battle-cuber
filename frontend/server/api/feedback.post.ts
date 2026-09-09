import nodemailer from 'nodemailer';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const config = useRuntimeConfig(event);


    const { pseudo,mail, message, type } = body;

   
    try {
         const transported = nodemailer.createTransport({
        service : 'gmail',
        auth: {
            user: config.gmailUser,
            pass: config.gmailPassword
        }
    });

    await transported.sendMail({
        from : `"Kaki Cube Battle <${config.gmailUser}>`,
        to: config.gmailUser,
        subject: `Un retour ${type} a été envoyé par ${pseudo.length > 0 ? pseudo : "un anonyme"} !`,
        text : `${message} \n ${mail.length > 0 ? 'Adresse mail de réponse: ' + mail : 'sans mail renseigné'}` ,
    });
    }catch(e : any) {
        console.log(e);
        throw createError({statusCode : 500, message : 'Une erreur serveur est survenue lors de l\'envoi du mail. Votre retour n\'a pas été pris en compte (oui c\'est un comble).'})
    }
   

    return  { success : true };
})