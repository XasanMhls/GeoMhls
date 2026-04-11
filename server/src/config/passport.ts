import passport from 'passport';
import { Strategy as GoogleStrategy, type Profile, type VerifyCallback } from 'passport-google-oauth20';
import { env, googleOAuthEnabled } from './env.js';
import { User } from '../models/User.js';

export function configurePassport() {
  if (!googleOAuthEnabled) {
    console.log('ℹ️  Google OAuth disabled (missing credentials)');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        passReqToCallback: false as false,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
      ) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Google'));

          let user = await User.findOne({ email });

          if (!user) {
            user = await User.create({
              email,
              name: profile.displayName || email.split('@')[0],
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
              passwordHash: null,
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
}
