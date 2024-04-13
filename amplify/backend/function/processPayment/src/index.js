const { CognitoIdentityServiceProvider } = require("aws-sdk");
const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider();
const USER_POOL_ID ="us-east-1_JYvGzZn6V";
const stripe = require("stripe")("sk_test_51P55ejSH7sSuMrXIaUNxTwcHWjZWhq25kH1OANvmbRElvGB8fjNmeBlomkobNi8PnHADTAz3wVk9nFS8XWKyPWa2003sAzsTik");

const getUserEmail = async (event) => {
  const params = {
    UserPoolId: "us-east-1_JYvGzZn6V",
    Username: event.identity.claims.username
  };
  const user = await cognitoIdentityServiceProvider.adminGetUser(params).promise();
  const { Value: email } = user.UserAttributes.find((attr) => {
    if (attr.Name === "email") {
      return attr.Value;
    }
  });
  return email;
};

/*
 * Get the total price of the order
 * Charge the customer
 */
exports.handler = async (event) => {
  try {
    const { id, cart, total, address, token } = event.arguments.input;
    const { username } = event.identity.claims;
    const email = await getUserEmail(event);

    await stripe.charges.create({
      amount: total * 100,
      currency: "usd",
      source: token,
      description: `Order ${new Date()} by ${username} with ${email} email`
    });
    return { id, cart, total, address, username, email };
  } catch (err) {
    throw new Error(err);
  }
};
