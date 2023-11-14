import nodemailer from "nodemailer";





export async function  sendConfirmationEmail (email,activationCode)  {

  try {
    const transporter = nodemailer.createTransport({

      service: "Gmail",
      auth: { 
       
        user: "oussama.said@esprit.tn",
        pass: "**********",
      },
    
    });

    await transporter.sendMail({

     from: "oussama.said@esprit.tn",
      to: email,
      subject: "Please confirm your account",
      text: "Email Confirmation " ,
       html: `<h1> This is your code </h1>
        <h3> ${activationCode}</h3>`,
    });
    
    console.log("email sent sucessfully");
  } catch (error) {
    console.log("email not sent");
    console.log(error);
  }
};

export default sendConfirmationEmail;