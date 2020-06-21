import { ActivityHandler,CardFactory } from 'botbuilder';
const card = require('../resources/InputFormCard.json');

export class EmptyBot extends ActivityHandler {
    constructor() {
        super();
        this.onMessage(async (context, next) => {
            if(context.activity.value)
            {
                await context.sendActivity(`Name: ${context.activity.value.firstName}\n\n\n\nMobile Number: ${context.activity.value.lastName}\n\n\n\nEmail: ${context.activity.value.email}`);;
            }
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    const inputCard = CardFactory.adaptiveCard(card);
                    await context.sendActivity('Hello world!');
                    await context.sendActivity({ attachments: [inputCard] });
                }
            }
            await next();
        });
    }
}
