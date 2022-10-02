# (Unofficial) Wodify API

## Motivation

I wanted to use a voice command to find out what tomorrow's workout would be without having to touch my phone. eg. "Hey Siri, what's tomorrow's workout?"

After discovering Apple supports triggering custom Shortcuts by voice on iPhone I was determined to make this happen.

## Apple Shortcuts

TODO: Add shortcuts

## Privacy

**Your email and password is used to login to your Wodify account.**

However, I have taken steps to protect your personal information.

1. All data is encrypted by SSL while in transit.
2. No personal data or Wodify session tokens are stored or logged.
3. A truncated hash of your email is logged on each request. This allows me to track the number of unique users without exposing your email address.

# Technical details below (if you are so inclined)

### Get the workout for a specific date

```
POST https://adam.royle.dev/wodify/workout
```

**Params**

| Name            | Required |                                                                                                             |
| --------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| email           | Yes      | The email used to login to Wodify.                                                                          |
| password        | Yes      | The password used to login to Wodify.                                                                       |
| date            | Yes      | The date in ISO 8601 format.                                                                                |
| include_section | No       | Exclude sections without a matching title. Case-insensitive.                                                |
| exclude_section | No       | Exclude sections with a matching title. Case-insensitive. Will be ignored if `include_section` is provided. |

**Example**

```sh
curl https://adam.royle.dev/wodify/workout \
  --data email=email@example.com \
  --data password=YourPassword1 \
  --data date=2022-09-27 \
  --data include_section=Pre-Metcon \
  --data include_section=Metcon
```

---

### Sign in to the next available class on a specific date

```
POST https://adam.royle.dev/wodify/signin
```

**Params**

| Name          | Required |                                                                                                          |
| ------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| email         | Yes      | The email used to login to Wodify.                                                                       |
| password      | Yes      | The password used to login to Wodify.                                                                    |
| date          | Yes      | The date in ISO 8601 format.                                                                             |
| include_class | No       | Exclude classes without a matching title. Case-insensitive.                                              |
| exclude_class | No       | Exclude classes with a matching title. Case-insensitive. Will be ignored if `include_class` is provided. |

**Example**

```sh
curl https://adam.royle.dev/wodify/signin \
  --data email=email@example.com \
  --data password=YourPassword1 \
  --data date=2022-09-27 \
  --data include_class=crossfit
```

## Running scripts locally

As this projects uses TypeScript and ESM, running the scripts locally are a bit verbose.

```sh
node --experimental-specifier-resolution=node --loader ts-node/esm scripts/login.ts email@example.com YourPassword1 2022-08-23
```

## Deploy this API to your AWS account

This project uses the [serverless framework](https://www.serverless.com/framework/docs/getting-started) to deploy AWS Lambda functions.

Assuming you have installed awscli and are logged in, you should be able to deploy these functions to your AWS account.

```
git clone https://github.com/adamroyle/wodify-api
cd wodify-api
yarn
yarn sls deploy
```
