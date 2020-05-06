"use strict";

const fetch = require("node-fetch");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Mailchimp env variables
const MAILCHIMP_API_USERNAME = process.env.MAILCHIMP_API_USERNAME;
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_TARGET_LIST = process.env.MAILCHIMP_TARGET_LIST;
// Mailchimp endpoint using v3.0
const dc = MAILCHIMP_API_KEY.split("-")[1];
const apiUrl = `https://${dc}.api.mailchimp.com/3.0`;
// Authorization
const auth = {
  username: MAILCHIMP_API_USERNAME,
  password: MAILCHIMP_API_KEY,
};

/**
 *
 * Subscribe to a mailchimp list
 * Accepts an email and a mailchimp-contact status
 *
 * More about mailchimp contact status here:
 * https://mailchimp.com/developer/guides/manage-subscribers-with-the-mailchimp-api/#Add_a_contact_status
 *
 * @param {string} email
 * @param {string} [status="pending"] - [subscribed || pending || unsubscribed || cleaned]
 */
async function subscribe(email, status = "pending") {
  const req = await fetch(`${apiUrl}/lists/${MAILCHIMP_TARGET_LIST}/members`, {
    method: "post",
    body: JSON.stringify({
      email_address: email,
      status: status,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(
        `${auth.username}:${auth.password}`
      ).toString("base64")}`,
    },
  });
  const resp = await req.json();
  return resp;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/webhook", (req, res) => {
  // For a better security in this webhook, mailchimp recommends to use a secret sent in the url
  if (
    req.body &&
    req.body.type === "subscribe" &&
    req.body.data &&
    req.body.data.list_id === MAILCHIMP_TARGET_LIST
  ) {
    const email = req.body.data.email;

    // Do whatever you need in here with your email verified.
    console.log("New email registered: ", email);

    res.send("ok");
  }
});

app.listen(8080, () => console.log(`Express Listening ...`));

module.exports = {
  subscribe,
};
