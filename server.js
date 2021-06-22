var express = require('express'),
    path = require('path'),
    app = express(),
    bodyParser = require('body-parser'),
    port = process.env.PORT || 3000,
    expressSwagger = require('express-swagger-generator')(app),
    cors = require('cors');
const UI_PATH = process.env.UI_PATH || './ui/build';

app.use(cors());

// serve the react app files
app.use(express.static(`${__dirname}/${UI_PATH}`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./routes'); //importing route
routes(app); //register the route

let swaggerOptions = {
    swaggerDefinition: {
        info: {
            description: 'EOS Oracle API',
            title: 'EOS Oracle',
            version: '1.0.0',
        },
        // host: 'localhost:' + port,
        produces: [
            "application/json"
        ],
        schemes: ['http', 'https'],
        securityDefinitions: {
            Basic: {
                type: 'basic'
            }
        }
    },
    basedir: __dirname,
    files: ['./routes.js']
};

expressSwagger(swaggerOptions);

// handle every other (than routes & swagger) route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('*', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, `${UI_PATH}`) });
});

app.listen(port);

console.log('EOS Oracle API server started on: ' + port);