// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityHandler, MessageFactory } from 'botbuilder';
const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

export class EchoBot extends ActivityHandler {
    constructor(conversationState, userState) {
        super();
        // Create accessors for state properties
        let conversationData = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        let userProfile = userState.createProperty(USER_PROFILE_PROPERTY);
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            // Get the state properties from the turn context.
            const userProfilevalue = await userProfile.get(context, {});
            const conversationDatavalue = await conversationData.get(context, {
                promptedForUserName: false,
                promptedForMobileNumber: false, promptedForEmail: false
            });

            if (!userProfilevalue.name) {
                // First time around this is undefined, so we will prompt user for name.
                if (!conversationDatavalue.promptedForUserName) {
                    // We haven't prompted them yet, so do it now.
                    await context.sendActivity('What is your name?');
                    // Set the flag to true, so we don't prompt in the next turn for name.
                    conversationDatavalue.promptedForUserName = true;
                } else {
                    // We prompted them, this must be their name.
                    userProfilevalue.name = context.activity.text;
                    // Next prompted for mobile number.
                    await context.sendActivity(`What is your mobile number?`);
                    // Set the flag to true for mobile number, so we don't prompt in the next turn.
                    conversationDatavalue.promptedForMobileNumber = true;
                }
            }
            else if (!userProfilevalue.mobile) {
                if (conversationDatavalue.promptedForMobileNumber) {
                    // We prompted them for mobile number, this must be their mobile number.
                    userProfilevalue.mobile = context.activity.text;
                    // Next prompted for Email.
                    await context.sendActivity(`Enter your Email?`);
                    // Set the flag to true for EMail, so we don't prompt in the next turn.
                    conversationDatavalue.promptedForEmail = true;
                }
            }
            else if (!userProfilevalue.Email) {
                if (conversationDatavalue.promptedForMobileNumber) {
                    // We prompted them, this must be their name.
                    userProfilevalue.Email = context.activity.text;
                    // Acknowledge that we got their name.
                    await context.sendActivity(`Name: ${userProfilevalue.name}\n\n\n\nMobile Number: ${userProfilevalue.mobile}\n\n\n\nEmail: ${userProfilevalue.Email}`);;
                }
            }
            else {
                // If we know the all the informations, just echo here whatever they say
            }
            // Persist any state changes during this turn.
            await conversationState.saveChanges(context, false);
            await userState.saveChanges(context, false);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
           // const welcomeText = 'Hello and welcome!';
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}
