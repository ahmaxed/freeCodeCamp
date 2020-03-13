/* eslint-disable camelcase */
import axios from 'axios';
import debug from 'debug';
import keys from '../../../config/secrets';

const log = debug('fcc:boot:donate');

const sandBoxSubdomain =
  process.env.FREECODECAMP_NODE_ENV === 'production' ? '' : 'sandbox.';

const verificationUrl = `https://api.${sandBoxSubdomain}paypal.com/v1/notifications/verify-webhook-signature`;
const tokenUrl = `https://api.${sandBoxSubdomain}paypal.com/v1/oauth2/token`;

export async function getAsyncPaypalToken() {
  try {
    const res = await axios.post(tokenUrl, null, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: keys.paypal.client,
        password: keys.paypal.secret
      },
      params: {
        grant_type: 'client_credentials'
      }
    });
    return res.data.access_token;
  } catch (err) {
    throw err;
  }
}

export function capitalizeKeys(object) {
  Object.keys(object).forEach(function(key) {
    object[key.toUpperCase()] = object[key];
  });
}

export async function verifyWebHook(headers, body, token, webhookId) {
  try {
    var webhookEventBody = typeof body === 'string' ? JSON.parse(body) : body;

    capitalizeKeys(headers);

    const payload = {
      auth_algo: headers['PAYPAL-AUTH-ALGO'],
      cert_url: headers['PAYPAL-CERT-URL'],
      transmission_id: headers['PAYPAL-TRANSMISSION-ID'],
      transmission_sig: headers['PAYPAL-TRANSMISSION-SIG'],
      transmission_time: headers['PAYPAL-TRANSMISSION-TIME'],
      webhook_id: webhookId,
      webhook_event: webhookEventBody
    };

    const response = await axios.post(verificationUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data.verification_status === 'SUCCESS') {
      return body;
    } else {
      throw {
        message: `Failed token verification.`,
        type: 'FailedPaypalTokenVerificationError'
      };
    }
  } catch (err) {
    if (err.type === 'FailedPaypalTokenVerificationError') {
      throw err;
    }
    throw new Error(err);
  }
}

export function verifyWebHookType(req) {
  // check if webhook type for creation
  const {
    body: { event_type }
  } = req;

  if (
    event_type === 'BILLING.SUBSCRIPTION.ACTIVATED' ||
    event_type === 'BILLING.SUBSCRIPTION.CANCELLED'
  )
    return req;
  else
    throw {
      message: 'Webhook type is not supported',
      type: 'UnsupportedWebhookType'
    };
}

export const createAsyncUserDonation = (user, donation) => {
  log(`Creating donation:${donation.subscriptionId}`);
  user
    .createDonation(donation)
    .toPromise()
    .catch(err => {
      throw new Error(err);
    });
};

export function removeFirstEmail(arr, email) {
  let index = arr.indexOf(email);
  if (index < 0) {
    log('Donation email not fund on user associated with donation');
    return arr;
  }
  return arr.slice(0, index).concat(arr.slice(index + 1, arr.length));
}

export function createDonationObj(body) {
  const {
    resource: {
      id,
      start_time,
      subscriber: { email_address } = {
        email_address: null
      }
    }
  } = body;

  let donation = {
    email: email_address,
    amount: 500,
    duration: 'month',
    provider: 'paypal',
    subscriptionId: id,
    customerId: email_address,
    startDate: new Date(start_time).toISOString()
  };
  return donation;
}

export function createDonation(body, app) {
  const { User } = app.models;
  const {
    resource: {
      subscriber: { email_address } = {
        email_address: null
      }
    }
  } = body;

  let donation = createDonationObj(body);

  let email = email_address;
  return User.findOne({ where: { email } }, (err, user) => {
    if (err) throw new Error(err);
    if (!user) {
      log(`Creating new user:${email}`);
      return User.create({ email })
        .then(user => {
          createAsyncUserDonation(user, donation);
        })
        .catch(err => {
          throw new Error(err);
        });
    }
    return createAsyncUserDonation(user, donation);
  });
}

export async function cancelDonation(body, app) {
  try {
    const {
      resource: { id, status_update_time = new Date(Date.now()).toISOString() }
    } = body;
    const { User, Donation } = app.models;
    Donation.findOne({ where: { subscriptionId: id } }, (err, donation) => {
      if (err || !donation) throw Error(err);
      const userId = donation.userId;
      log(`Updating donation record: ${donation.subscriptionId}`);
      donation.updateAttributes({
        endDate: new Date(status_update_time).toISOString()
      });

      User.findOne({ where: { id: userId } }, (err, user) => {
        if (err || !user || !user.donationEmails) throw Error(err);
        log('Updating user record for donation cancellation');
        user.updateAttributes({
          isDonating: false
        });
      });
    });
  } catch (err) {
    throw new Error(err);
  }
}

export async function updateUser(body, app) {
  const { event_type } = body;
  if (event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
    createDonation(body, app);
  } else if (event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
    cancelDonation(body, app);
  } else
    throw {
      message: 'Webhook type is not supported',
      type: 'UnsupportedWebhookType'
    };
}
