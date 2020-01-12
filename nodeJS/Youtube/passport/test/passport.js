//passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const knex = require('knex')({
    client: 'postgresql',
    connection: {
        database: "test",
        user: "howangleung",
        password: "postgres"
    }
});

module.exports = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use('local-signup', new LocalStrategy(
        async (email, password, done) => {
            try{
                let users = await knex('users').where({email:email});
                if (users.length > 0) {
                    return done(null, false, { message: 'Email already taken' });
                }
                const newUser = {
                    email:email,
                    password: password
                };
                let userId = await knex('users').insert(newUser).returning('id');
                newUser.id = userId[0];
                done(null,newUser);
            }catch(err){
                done(err);
            }
    
        })
    );

    passport.use('local-login', new LocalStrategy(
        async (email, password, done) => {
            try{
                let users = await knex('users').where({email:email});
                if (users.length == 0) {
                    return done(null, false, { message: 'Incorrect credentials.' });
                }
                let user = users[0];
                if (user.password === password) {
                    return done(null, user);
                }else{
                    return done(null, false, { message: 'Incorrect credentials.' });
                }
            }catch(err){
                return done(err);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        let users = await knex('users').where({id:id});
        if (users.length == 0) {
            return done(new Error(`Wrong user id ${id}`));
        }
        let user = users[0];
        return done(null, user);
    });
};