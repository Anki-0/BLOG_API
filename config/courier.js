const { CourierClient } = require('@trycourier/courier');

const courier = CourierClient({
 authorizationToken: 'pk_prod_X7EYM3REXTMH9FH2DGE3YF55A7HB',
});

// const { messageId } = await courier.send({
//   eventId: "personalized-welcome-email",
//   recipientId: "Github_26327320",
//   profile: {
//   },
//   data: {
//     firstname: "Ankit",
//   },
//   override: {
//   },
// });
courier
 .send({
  eventId: 'personalized-welcome-email',
  recipientId: 'Github_26327320',
  profile: {
   email: 'trickbust@gmail.com',
  },
  data: {
   name: 'Tony',
   inviteLink: 'https://courier.com/register?code=blah',
  },
  override: {
   smtp: {
    body: {
     attachments: [
      {
       filename: 'text1.txt',
       content: 'aGVsbG8gd29ybGQh',
       encoding: 'base64',
      },
     ],
    },
   },
  },
 })
 .then((res) => {
  console.log('Email sent', res);
 })
 .catch((error) => {
  console.error(error);
 });
