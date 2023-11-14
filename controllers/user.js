import User, { loginValidate, userValidate } from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer';
import { Error } from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { render } from 'ejs';
import sendConfirmationEmail from "../middlewares/mailer.js";
import crypto from 'crypto';
import moment from 'moment';
import schedule from 'node-schedule';




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getAll(req, res) {
    try {
        const users = await User
            .find({}).lean();
        console.log(users);
        res.status(200).json({users});
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function getAllusr(req, res) {
    res.send({users: await User.find()})
}
export async function profile(req, res) {
    try {
        const { _id } = req.user;
        const connectedUser = await User.findById(_id).lean();
        res.status(200).json(connectedUser);
    } catch (err) {
        res.status(401).json({ "message": "authentication problem" })
    }

}


// register
export async function register(req, res) {
    const { error } = userValidate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let user;
    try {
        user = await User.findOne({ email: req.body.email });
    } catch (err) {
        return res.status(500).send('An error occurred while searching for the user.');
    }
    
    if (user) {
        return res.status(404).send('Email already exists');
    }
    

    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const { username, email } = req.body
    await User
        .create({
            username,
            email,
            password: hashedPassword,
            role: "user",
            otpCode: "$2b$10$mhjRG0mlSuN3KaFu5UcndumyAfO0AAwDR",
            
        })
        .then(docs => {
            res.status(200).json({ message: 'User Added Successfully!', docs });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
    await sendRegistrationMail(email);
}

// export async function register(req, res) {
//     try {
//         const { error } = userValidate(req.body);

//         if (error) {
//             return res.status(400).send(error.details[0].message);
//         }

//         let existingUser;
//         try {
//             existingUser = await User.findOne({ email: req.body.email });
//         } catch (err) {
//             return res.status(500).send('An error occurred while searching for the user.');
//         }

//         if (existingUser) {
//             return res.status(400).send('Email already exists');
//         }

//         const hashedPassword = await bcrypt.hash(req.body.password, 10);
//         const { username, email } = req.body;

//         const newUser = await User.create({
//             username,
//             email,
//             password: hashedPassword,
//         });

//         res.status(200).json({ message: 'User Added Successfully!', user: newUser });
//         await sendRegistrationMail(email);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: err.message });
//     }
// }
export async function sendMail(req, res) {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "oussama.said@esprit.tn",
                pass: "**********"
            },
        });
        let info = transporter.sendMail({
            from: "oussama.said@esprit.tn",
            to: "oussamasaid929@gmail.com",
            subject: "Message",
            text: "I hope this message gets through!",
        });
        res.json(info);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }


}

export async function sendRegistrationMail(email) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "oussama.said@esprit.tn",
            pass: "**********"
        },
    });
    transporter.sendMail({
        from: "oussama.said@esprit.tn",
        to: email,
        subject: "welcome",
        text: "welcome to hungry",
    });
}


//login 

export async function login(req, res) {
    const { error } = loginValidate(req.body);
  
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
  
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send('Invalid email');
    }
  
    const checkPassword = await bcrypt.compare(req.body.password, user.password);
    if (!checkPassword) {
      return res.status(404).send('Invalid password');
    }
  
    // Générer un code unique et sécurisé composé de 8 caractères
    const confirmCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  
    // Crypter le code avec bcrypt
    // const salt = await bcrypt.genSalt(10);
    // const hashedCode = await bcrypt.hash(confirmCode, salt);
  
    // Définir l'heure d'expiration du code
    const expiration = moment().add(5, 'minutes');
  
    //user.code = hashedCode;
    user.code = confirmCode;
    user.codeExpiration = expiration;
    await user.save();
  
    // Envoyer l'e-mail avec le code
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'oussama.said@esprit.tn',
        pass: '**********'
      }
    });
  
    const mailOptions = {
      from: 'oussama.said@esprit.tn',
      to: user.email,
      subject: 'Code to link your account to our game Haven',
      text: `Your code is ${confirmCode}. This code will expire at ${expiration.format('MMMM Do YYYY, h:mm:ss a')}.`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('E-mail envoyé : ' + info.response);
      }
    });
  
    // Planifier la suppression de l'attribut "code" de l'objet "user" après cinq minutes
    schedule.scheduleJob(expiration.toDate(), async function() {
      user.code = null;
      user.codeExpiration = null;
      await user.save();
    });
  
    // Retourner la réponse avec le token et l'utilisateur
    const token = jwt.sign({ _id: user._id }, 'privateKey');
    res.header('x-auth-token', token).status(200).send({ token: token, user: user });
  }
  
//Recherche d’un seul document
export async function getOnce(req, res) {

    await User
        .findById(req.params.id)
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
}

export async function patchOnce(req, res) {

    await User
        //findByIdAndUpdate si vous voulez modifier un document à l’aide de son ID.
        .findByIdAndUpdate(req.params.id, req.body)
        .then(docs => {
            res.status(200).json(docs);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });

}

export async function deleteOnce(req, res) {
    try {
        let checkIfUserExists = await User.findById(req.params.id);
        if (!checkIfUserExists) throw new Error();
        const user = await User
            .findByIdAndRemove(req.params.id)
        res.status(200).json({ "message": user });
    } catch (err) {
        res.status(404).json({ message: "user not found" });
    }

}

//forgot password





export  async function forgetPassword (req, res, next) {

        const { email } = req.body;

        const renderedUser = await User.findOne({ email });

        if (!renderedUser) {

            throw new Error("user not found");
        }
       // sendRegistrationMail(email)
       sendMail()
        res.status(200).json({ code: renderedUser.otpCode });

     /**
      * 
      * let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "oussama.said@esprit.tn",
                pass: ""
            },
        });

        transporter.sendMail({
            from: "oussama.said@esprit.tn",
            to: email,
            subject: "forget password",
            text: `here your reset password code ${renderedUser.otpCode}`,
        });
      * 
      * 
      *  */   


    
};

export const validateCode = async (req, res, next) => {
    try {
      const { code, email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("wrong email");
      }
      const isValidCode = await bcrypt.compare(code.toString(), user.otpCode);
      if (isValidCode) {
        res.status(200).json({ message: "Code is valid" });
      } else {
        throw new Error("wrong code");
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  };
  

  // export const changePassword = async (req, res, next) => {
  //   try {
  //     const { token, newPassword, repeterVotreNewPassword } = req.body;
  //     const user = await User.findOne({ resetPasswordToken: token });
  
  //     if (!user) {
  //       throw new Error("Invalid or expired token");
  //     }
  
  //     // Vérifiez la date d'expiration du jeton ici
  //     if (user.resetPasswordExpires < new Date()) {
  //       throw new Error("Token has expired");
  //     }
  
  //     if (newPassword !== repeterVotreNewPassword) {
  //       throw new Error("Passwords do not match");
  //     }
  
  //     // Vérifiez la complexité du mot de passe
  //     const passwordRegex = /^(?=.*[A-Z]).{8,}$/; // Au moins une lettre majuscule et au moins 8 caractères
  //     if (!passwordRegex.test(newPassword)) {
  //       throw new Error("Password must contain at least one uppercase letter and be at least 10 characters long.");
  //     }
  
  //     // Réinitialisez le mot de passe
  //     const updatedUser = await User.findOneAndUpdate(
  //       { _id: user._id || user.id },
  //       {
  //         $set: {
  //           password: await bcrypt.hash(newPassword, 10),
  //           resetPasswordToken: null,
  //           resetPasswordExpires: null,
  //         },
  //       },
  //       { returnOriginal: false }
  //     );
  
  //     res.status(200).json({ user: updatedUser });
  //   } catch (err) {
  //     console.log(err);
  //     res.status(400).json({ message: err.message }); // Utilisation du code d'état 400 pour des erreurs de validation
  //   }
  // };

  export const changePassword = async (req, res, next) => {
    try {
        const { email, newPassword, repeterVotreNewPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("User not found");
        }

        // Check if the date for password reset has expired
        if (user.resetPasswordExpires < new Date()) {
            throw new Error("Token has expired");
        }

        if (newPassword !== repeterVotreNewPassword) {
            throw new Error("Passwords do not match");
        }

        // Check the complexity of the new password
        const passwordRegex = /^(?=.*[A-Z]).{8,}$/; // At least one uppercase letter and at least 8 characters
        if (!passwordRegex.test(newPassword)) {
            throw new Error("Password must contain at least one uppercase letter and be at least 10 characters long.");
        }

        // Reset the password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null,
                },
            },
            { new: true } // Return the modified document
        );

        res.status(200).json({ user: updatedUser });
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
    }
};

  
  
  
  

  export const changePasswordInProfile = async (req, res, next) => {
    try {
      const { email, password, newPassword } = req.body; // Utilisez le corps de la requête pour obtenir l'e-mail
  
      // Vérifiez si l'e-mail est fourni
      if (!email) {
        throw new Error("Email is required in the request body");
      }
  
      const renderedUser = await User.findOne({ email }); // Recherchez l'utilisateur par email
      if (!renderedUser) {
        throw new Error("User not found with the provided email");
      }
  
      const checkIfPasswordIsOkay = await bcrypt.compare(password, renderedUser.password);
      if (!checkIfPasswordIsOkay) {
        throw new Error("Wrong password");
      }
  
      const updatedUser = await User.findOneAndUpdate({ email: renderedUser.email }, {
        $set: {
          password: await bcrypt.hash(newPassword, 10),
        }
      }, { returnOriginal: false });
      res.status(200).json({ user: updatedUser });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: err.message }); // Utilisation du code d'état 400 pour des erreurs de validation
    }
  }
  
  


//  reset Password email 

// export async function resetPass(req, res) {
//     try {
//       const user = await User.findOne({ email: req.body.email });
  
//       if (!user) {
//         return res.status(404).send({ message: "User not found" });
//       }
  
//       const newCode = Math.floor(1000 + Math.random() * 9000);
//       const encryptedCode = await bcrypt.hash(newCode.toString(), 10);
  
//       user.otpCode = encryptedCode;
  
//       await user.save();
//       await sendConfirmationEmail(req.body.email, newCode);
  
//       res.status(200).send({ newCode });
//     } catch (err) {
//       console.log("Error: ", err);
//       res.status(500).send({ message: err.message });
//     }
//   }
// 
export async function resetPass(req, res) {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        const newCode = Math.floor(1000 + Math.random() * 9000);
        const encryptedCode = await bcrypt.hash(newCode.toString(), 10);

        user.otpCode = encryptedCode;
        sendConfirmationEmail(req.body.email, newCode);

        await user.save();
        res.status(200).send({ newCode });
    } catch (err) {
        console.log("error", err);
        res.status(500).send({ message: err.message });
    }
}