var accountSid = 'AC7bb50dcee0ad010577402615d96f2a07';
var authToken = 'aadf08afe6830545e3f2e7d33dc45c8a';
var fromNumber = '16697211646';
var https = require('https');
var queryString = require('querystring');
// Lambda function:
exports.handler = function (event, context) {
    console.log('Running event');
    // Send an SMS message to the number provided in the event data.
    // End the lambda function when the send function completes.
    SendSMS(event.to, 'Hello from Lambda Functions!', function (status) {
        context.done(null, status);
    });
};
// Sends an SMS message using the Twilio API
// to: Phone number to send to
// body: Message body
// completedCallback(status) : Callback with status message when the function completes.
function SendSMS(to, body, callback) {
    // The SMS message to send
    var message = {
        To: to
        , From: 16697211646
        , Body: body
    };
    var messageString = queryString.stringify(message);
    // Options and headers for the HTTP request   
    var options = {
        host: 'api.twilio.com'
        , port: 443
        , path: '/2010-04-01/Accounts/' + accountSid + '/Messages.json'
        , method: 'POST'
        , headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            , 'Content-Length': Buffer.byteLength(messageString)
            , 'Authorization': 'Basic ' + new Buffer(accountSid + ':' + authToken).toString('base64')
        }
    };
    // Setup the HTTP request
    var req = https.request(options, function (res) {
        res.setEncoding('utf-8');
        // Collect response data as it comes back.
        var responseString = '';
        res.on('data', function (data) {
            responseString += data;
        });
        // Log the responce received from Twilio.
        // Or could use JSON.parse(responseString) here to get at individual properties.
        res.on('end', function () {
            console.log('Twilio Response: ' + responseString);
            var parsedResponse = JSON.parse(responseString);
            var sessionAttributes = {};
            var cardTitle = "Sent";
            var speechOutput = "Message Sent Successfully";
            var repromptText = "";
            var shouldEndSession = true;
            if ("queued" === parsedResponse.status) { // we're good, variables already set..
            }
            else {
                speechOutput = parsedResponse.message;
            }
            callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        });
    });
    // Handler for HTTP request errors.
    req.on('error', function (e) {
        console.error('HTTP error: ' + e.message);
        var sessionAttributes = {};
        var cardTitle = "Sent";
        var speechOutput = "Unfortunately, sms request has finished with errors.";
        var repromptText = "";
        var shouldEndSession = true;
        callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    });
    // Send the HTTP request to the Twilio API.
    // Log the message we are sending to Twilio.
    console.log('Twilio API call: ' + messageString);
    req.write(messageString);
    req.end();
}
// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);
        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
             context.fail("Invalid Application ID");
         }
        */
        if (event.session.new) {
            onSessionStarted({
                requestId: event.request.requestId
            }, event.session);
        }
        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request, event.session, function callback(sessionAttributes, speechletResponse) {
                context.succeed(buildResponse(sessionAttributes, speechletResponse));
            });
        }
        else if (event.request.type === "IntentRequest") {
            onIntent(event.request, event.session, function callback(sessionAttributes, speechletResponse) {
                context.succeed(buildResponse(sessionAttributes, speechletResponse));
            });
        }
        else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    }
    catch (e) {
        context.fail("Exception: " + e);
    }
};
/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId + ", sessionId=" + session.sessionId);
}
/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId + ", sessionId=" + session.sessionId);
    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}
/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId + ", sessionId=" + session.sessionId);
    var intent = intentRequest.intent
        , intentName = intentRequest.intent.name;
    if ("SendSms" === intentName) {
        var destination = intentRequest.intent.slots.destination.value;
        var text = intentRequest.intent.slots.text.value;
        var number;
        if ("ron" == destination) {
            number = "4084315430";
        }
        else if ("shishir" == destination) {
            number = "3129821972";
        }
        else if ("sahar" == destination) {
            number = "7039377817";
        }
        else if ("neil" == destination) {
            number = "4083133916";
        }
        else if ("riz" == destination) {
            number = "5136529890";
        }
        else if ("Ron" == destination) {
            number = "4084315430";
        }
        else if ("R" === destination) {
            number = "5105790004";
        }
        SendSMS(number, text, callback);
    }
    else if ("workout" === intentName) {
        var destination = intentRequest.intent.slots.muscle.value;
        if ("chest" === destination) {
            ChestRequest(intent, session, callback);
        }
        else if ("abs" === destination) {
            handleAbsRequest(intent, session, callback);
        }
        else if ("cardio" === destination) {
            handleCardioRequest(intent, session, callback);
        }
        else if ("yoga" === destination) {
            handleYogaRequest(intent, session, callback);
        }
    }
    else {
        throw "Invalid intent";
    }
}


function ChestRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Let's workout that chest. Give me ten pushups in ten seconds. Ready. Three. Two. One. <break time='10s'/> Lets go again!", "", "true"));
}

function AbsRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Let's see that 6-pack. Give me ten crunches in ten seconds. Let's go! <break time='10s'/>  Push yourself again. Let's go", "", "true"));
}

function CardioRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Time for cardio! Twenty jumping jacks in ten seconds. Ready. Three. Two. One. Go. <break time='10s'/> Let's work some more!", "", "true"));
}

function YogaRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Welcome to the yoga workout. Perform a ten second leg stretch. Ready. Three. Two. One. <break time='10s'/> We’re done. Let’s do it again. Don’t be lazy. ", "", "true"));
}


/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId + ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}
// --------------- Functions that control the skill's behavior -----------------------
function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Let's start your morning routine.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please tell me what action to undertake. ";
    var shouldEndSession = false;
    callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}
// --------------- Helpers that build all of the responses -----------------------
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText"
            , text: output
        }
        , card: {
            type: "Simple"
            , title: "SessionSpeechlet - " + title
            , content: "SessionSpeechlet - " + output
        }
        , reprompt: {
            outputSpeech: {
                type: "PlainText"
                , text: repromptText
            }
        }
        , shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0"
        , sessionAttributes: sessionAttributes
        , response: speechletResponse
    };
}