/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Smuckwell Industries. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------
**/

/**
 * This Alexa skill is built with Amazon Alexa Skills nodejs skill development kit.
 * It is based on this template https://github.com/alexa/skill-sample-nodejs-howto
 **/

'use strict';

const Alexa = require('alexa-sdk');
const https = require('https');
const querystring = require('querystring');

const APP_ID = 'amzn1.ask.skill.11111111-1111-1111-1111-111111111111'; // TODO replace with your app ID (OPTIONAL).
const sleep_status_slept = 'Slept';
const sleep_status_woke_up = 'Woke up';
const child_name = 'Your child\'s name'; // TODO replace this with your child's name

const languageStrings = {
    'en': {
        translation: {
            SKILL_NAME: 'Go to Sleep',
            WELCOME_MESSAGE: "Welcome to %s. You can tell me things like " + child_name + " slept through the night or " + child_name + " woke me up last night ... Now, what can I help you with?",
            WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
            DISPLAY_CARD_TITLE: '%s',
            HELP_MESSAGE: "You can tell me things like " + child_name + " slept through the night or " + child_name + " woke me up last night...Now, what can I help you with?",
            HELP_REPROMPT: "You can tell me things like " + child_name + " slept through the night or " + child_name + " woke me up last night...Now, what can I help you with?",
            STOP_MESSAGE: 'Goodbye!',
            SLEEP_RECORDED_MESSAGE: "That is great. I will record this to the sleep log. Good job " + child_name + "!",
            WAKE_RECORDED_MESSAGE: "That is too bad. I will record this to the sleep log. Keep trying " + child_name + ".",
        },
    },
    'en-US': {
        translation: {
            SKILL_NAME: 'Go to Sleep',
        },
    },
};

const handlers = {
    //Use LaunchRequest, instead of NewSession if you want to use the one-shot model
    // Alexa, ask [my-skill-invocation-name] to (do something)...
    'LaunchRequest': function () {
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'record_sleep': function () {
        this.attributes.speechOutput = this.t('SLEEP_RECORDED_MESSAGE', this.t('SKILL_NAME'));
        this.response.speak(this.attributes.speechOutput)
        this.emit(':responseReady');
        PostSleepStatus(sleep_status_slept);
    },
    'record_wake_up': function () {
        this.attributes.speechOutput = this.t('WAKE_RECORDED_MESSAGE', this.t('SKILL_NAME'));
        this.response.speak(this.attributes.speechOutput)
        this.emit(':responseReady');
        PostSleepStatus(sleep_status_woke_up);
    },
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.RepeatIntent': function () {
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        console.log(`Session ended: ${this.event.request.reason}`);
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
};

function PostSleepStatus(sleepStatus)
{
    var sleep_status = querystring.stringify({'sleep_status' : sleepStatus});
    //Example URL for a Flow based micro-service https://prod-75.westus.logic.azure.com:443/workflows/11111111111111111111111111111111/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=1111-11111111111111111111111111111111111111
    //See https://flow.microsoft.com/en-us/blog/call-flow-restapi/
    var post_options = {
        host: 'prod-75.westus.logic.azure.com',//TODO change this to your URL host domain name
        port: '443',
        path: 'workflows/11111111111111111111111111111111/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=1111-11111111111111111111111111111111111111', //TODO change this to the URL path for your service
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(sleep_status)
        }
    };
    
    var post_request = https.request(post_options, function(res){
        res.setEncoding('utf8');
    });
    
    post_request.write(sleep_status);
    post_request.end();
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
