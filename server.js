const express = require("express");
const path = require("path");
const http = require("http");
const app = express();
const server = http.createServer(app);
const nunjucks = require('nunjucks');
const axios = require('axios');
const qs = require('qs');
const session = require('express-session');
const io = require("socket.io")(server);

// Server all the static files from www folder
app.use(express.static(path.join(__dirname, "www")));
app.use(express.static(path.join(__dirname, "icons")));
app.use(express.static(path.join(__dirname, "node_modules/vue/dist/")));


app.set('view engine', 'html');
nunjucks.configure('www', {
    express: app,
})

app.use(session({
        secret: 'ras',
        resave: true,
        secure: false,
        saveUninitialized: false,
    })) //세션을 설정할 때 쿠키가 생성된다.&&req session의 값도 생성해준다. 어느 라우터든 req session값이 존재하게 된다.

const kakao = {
        clientID: '51e4976c7ef7df823c92663cdaef6fbc',
        clientSecret: 'pSgJYbhkgNFdAkZZ0R2jfM4QxBUS7XQQ',
        //redirectUri: 'https://comeon-yo.herokuapp.com/auth/kakao/callback'
        redirectUri: 'http://localhost:3000/auth/kakao/callback',
        logoutRedirectUri: 'http://localhost:3000/auth/kakao/logout',
    }
    //profile account_email
app.get('/auth/kakao', (req, res) => {
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}&response_type=code&scope=profile_nickname,profile_image,account_email`;
    res.redirect(kakaoAuthURL);
})


app.get('/auth/kakao/callback', async(req, res) => {
    //axios>>promise object
    try { //access토큰을 받기 위한 코드
        token = await axios({ //token
            method: 'POST',
            url: 'https://kauth.kakao.com/oauth/token',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify({
                    grant_type: 'authorization_code', //특정 스트링
                    client_id: kakao.clientID,
                    client_secret: kakao.clientSecret,
                    redirectUri: kakao.redirectUri,
                    code: req.query.code, //결과값을 반환했다. 안됐다.
                }) //객체를 string 으로 변환
        })
    } catch (err) {
        res.json(err.data);
    }
    //access토큰을 받아서 사용자 정보를 알기 위해 쓰는 코드
    let user;
    try {
        console.log(token); //access정보를 가지고 또 요청해야 정보를 가져올 수 있음.
        user = await axios({
            method: 'get',
            url: 'https://kapi.kakao.com/v2/user/me',
            headers: {
                Authorization: `Bearer ${token.data.access_token}`
            } //헤더에 내용을 보고 보내주겠다.
        })
    } catch (e) {
        res.json(e.data);
    }
    console.log(user);

    req.session.kakao = user.data;
    //req.session = {['kakao'] : user.data};
    res.redirect('../../');
})


app.get('/auth/profile', (req, res) => {
    if (req.session.kakao) {
        let { id } = req.session.kakao;
        let { nickname } = req.session.kakao.properties;
        let { email } = req.session.kakao.kakao_account;
        res.send({ 'id': id, 'nickname': nickname, 'email': email });

    } else {
        res.send('unlogin');
    }

});


app.get('/login', (req, res) => {
    res.render('auth/index');
});

app.get('/logout', async(req, res) => {
    let logout;
    try {
        logout = await axios({
            method: 'get',
            url: 'https://kauth.kakao.com/oauth/logout?client_id='+kakao.clientID+'&logout_redirect_uri='+kakao.logoutRedirectUri,
        })
    } catch (e) {
        res.json(e.data);
    }
    console.log(logout);
    req.session.destroy();

});

app.get('/auth/kakao/logout', async(req, res) => {
   
    console.log('logout!!!!!!');


})


app.get(kakao.redirectUri)

app.get("/legal", (req, res) => res.sendFile(path.join(__dirname, "www/legal.html")));

// Get PORT from env variable else assign 3000 for development
const PORT = process.env.PORT || 3000;
server.listen(PORT, null, () => console.log("Listening on port " + PORT));

