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
            const conversationDatavalue = await conversationData.get(context, { promptedForUserName: false });

            if (!userProfilevalue.name) {

                // First time around this is undefined, so we will prompt user for name.
                if (!conversationDatavalue.promptedForUserName) {
                    // We haven't prompted them yet, so do it now.
                    await context.sendActivity('What is your name?');
                    // Set the flag to true, so we don't prompt in the next turn.
                    conversationDatavalue.promptedForUserName = true;
                } else {
                    // We prompted them, this must be their name.
                    userProfilevalue.name = context.activity.text;
                    // Acknowledge that we got their name.
                    await context.sendActivity(`Thanks ${userProfilevalue.name}, now I'll repeat everything you say.`);
                }

            } else {

                // If we know the user's name, just echo whatever they say
                await context.sendActivity(`${userProfilevalue.name} said, "${context.activity.text}"`);

            }

            let turnCount = conversationDatavalue.turnCount || 0;
            conversationDatavalue.turnCount = ++turnCount;
            // Add message details to the conversation data.
            await context.sendActivity(
                `(We've been chatting over the ${context.activity.channelId}
                 channel for ${conversationDatavalue.turnCount} turns)`);

            // Persist any state changes during this turn.
            await conversationState.saveChanges(context, false);
            await userState.saveChanges(context, false);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}
