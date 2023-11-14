import express from 'express';

import { register, deleteOnce, getAll, getOnce, patchOnce, login, profile, sendMail, sendRegistrationMail, forgetPassword, changePassword, changePasswordInProfile, resetPass, getAllusr } from '../controllers/user.js';
//import sendRegistrationMail from '../controllers/user.js'