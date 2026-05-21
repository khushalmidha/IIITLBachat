import User from "../models/UserSchema.js";
import bcrypt from "bcrypt";

const publicUser = (user) => {
    const plainUser = user.toObject ? user.toObject() : { ...user };
    delete plainUser.password;
    return plainUser;
};
export const registerControllers = async (req, res, next) => {
    try{
        const {name, email, password} = req.body;

        // console.log(name, email, password);

        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "Please enter All Fields",
            }) 
        }

        let user = await User.findOne({email});

        if(user){
            return res.status(409).json({
                success: false,
                message: "User already Exists",
            });
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        // console.log(hashedPassword);

        let newUser = await User.create({
            name, 
            email, 
            password: hashedPassword, 
        });

        return res.status(200).json({
            success: true,
            message: "User Created Successfully",
            user: publicUser(newUser)
        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }

}
export const loginControllers = async (req, res, next) => {
    try{
        const { email, password } = req.body;

        // console.log(email, password);
  
        if (!email || !password){
            return res.status(400).json({
                success: false,
                message: "Please enter All Fields",
            }); 
        }
    
        const user = await User.findOne({ email });
    
        if (!user){
            return res.status(401).json({
                success: false,
                message: "User not found",
            }); 
        }
        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: "Please continue with Google login for this account",
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch){
            return res.status(401).json({
                success: false,
                message: "Incorrect Email or Password",
            }); 
        }

        delete user.password;

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}`,
            user: publicUser(user),
        });

    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

export const setAvatarController = async (req, res, next)=> {
    try{

        const userId = req.params.id;
       
        const imageData = req.body.image;

        if (!userId || !imageData) {
            return res.status(400).json({
                success: false,
                message: "User id and avatar image are required",
            });
        }
      
        const userData = await User.findByIdAndUpdate(userId, {
            isAvatarImageSet: true,
            avatarImage: imageData,
        },
        { new: true });

        if (!userData) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please login again.",
            });
        }

        return res.status(200).json({
            success: true,
            isSet: userData.isAvatarImageSet,
            image: userData.avatarImage,
            user: publicUser(userData),
          });


    }catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}
export const allUsers = async (req, res, next) => {
    try{
        const user = await User.find({_id: {$ne: req.params.id}}).select([
            "email",
            "username",
            "avatarImage",
            "_id",
        ]);

        return res.json(user);
    }
    catch(err){
        next(err);
    }
}
export const googleAuthController = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required",
            });
        }

        const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
        const googleRes = await fetch(verifyUrl);
        const profile = await googleRes.json();

        if (!googleRes.ok || profile.error) {
            return res.status(401).json({
                success: false,
                message: profile.error_description || "Google login failed",
            });
        }

        if (
            process.env.GOOGLE_CLIENT_ID &&
            profile.aud !== process.env.GOOGLE_CLIENT_ID
        ) {
            return res.status(401).json({
                success: false,
                message: "Google client mismatch",
            });
        }

        const email = profile.email;
        if (!email || profile.email_verified !== "true") {
            return res.status(401).json({
                success: false,
                message: "Google email is not verified",
            });
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name: profile.name || email.split("@")[0],
                email,
                googleId: profile.sub,
                authProvider: "google",
                avatarImage: profile.picture || "",
                isAvatarImageSet: Boolean(profile.picture),
            });
        } else {
            user.googleId = user.googleId || profile.sub;
            user.authProvider = user.authProvider || "google";
            if (!user.avatarImage && profile.picture) {
                user.avatarImage = profile.picture;
                user.isAvatarImageSet = true;
            }
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: `Welcome, ${user.name}`,
            user: publicUser(user),
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};