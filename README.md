# Sign into CrossFit (Wodify) using Siri

"Hands? Where we're going, we don't need hands!" – _Adam Royle, allegedly_

https://user-images.githubusercontent.com/25002779/193733401-108d7680-cace-4871-af75-717e0d7c6065.mp4

## Wait!? How does that work?

It uses [Shortcuts](https://support.apple.com/en-au/guide/shortcuts/welcome/ios) to imitate the actions you'd normally take on [Wodify's mobile app](https://www.wodify.com/products/mobile-app). You can trigger these shortcuts with your voice, your phone's location, or even your finger if you prefer!

## OK, that's very cool, will they work for me?

Of course! Tap these icons to save them to your Shortcuts app.

<p>
<a href="https://www.icloud.com/shortcuts/9f134312530442e484b3534259c3a219"><img src="https://user-images.githubusercontent.com/25002779/194006190-03cd4606-6a92-486a-87e0-60798a13ad61.png" width="200" alt="Sign me in to CrossFit" /></a>
&nbsp;&nbsp;&nbsp;
<a href="https://www.icloud.com/shortcuts/fe4749c122514a67a9bf39eadb71ae01"><img src="https://user-images.githubusercontent.com/25002779/194006197-9d2a3b18-4658-4998-b6ea-99799d513750.png" width="200" alt="What's today's workout?" /></a>
&nbsp;&nbsp;&nbsp;
  <a href="https://www.icloud.com/shortcuts/320b006c0cf945bc92a8de556047c8b6"><img src="https://user-images.githubusercontent.com/25002779/194006203-8642e8ce-5902-4f1c-808d-e290c4490b04.png" width="200" alt="What's tomorrow's workout?" /></a>
</p>

On setup you will be prompted to enter your Wodify login details (email and password) and some optional configuration.

They will now appear in your list of shortcuts and can then be added to your homescreen if you like.

When you first run each shortcut, you will need to allow connections to `adam.royle.dev`.

<img src="https://user-images.githubusercontent.com/25002779/194011680-48b2132b-c4c8-493a-8888-bb823ff19817.png" width="400" />

## Privacy Considerations

Unfortunately Wodify doesn't let us take actions on your behalf without knowing your login details.

However, we take security and privacy seriously and we've taken these steps to protect your personal information.

1. All data is encrypted using SSL while transmitted.
2. No personal information or security tokens are stored or logged in our system.
3. A truncated hash of your email is logged on each request (it looks something like `e42dc77f`). This allows tracking the number of unique users without saving your email address.

_Disclaimer: Use these shortcuts at your own risk. No responsibility will be taken if your Wodify account is compromised or login details exposed._

## Questions (and answers!)

<details><summary>

### Sign in when you arrive at the gym (using Location Services)</summary>

You can create a personal automation that will sign you into the next class when you arrive at the gym. A story in pictures!

<img src="https://user-images.githubusercontent.com/25002779/193749886-8b25137c-569f-4c7f-a953-5c7a03a8ec7d.png" width="250" />
<img src="https://user-images.githubusercontent.com/25002779/193749891-46bad621-1593-4d23-9b93-cc6e4686c20f.png" width="250" />
<img src="https://user-images.githubusercontent.com/25002779/193749894-19edfb84-4fa5-4d70-ac1f-76c199e77b2a.png" width="250" />
<img src="https://user-images.githubusercontent.com/25002779/193749895-499a9bf8-adeb-4a7b-bfc4-594aec18ff73.png" width="250" />
<img src="https://user-images.githubusercontent.com/25002779/193749897-28f9b530-a649-46bf-898b-4e9c697336ac.png" width="250" />
<img src="https://user-images.githubusercontent.com/25002779/193749898-c759f62c-5227-47cb-8981-9ef073a636b5.png" width="250" />
<img src="https://user-images.githubusercontent.com/25002779/193749900-d7afd777-91d4-46be-bae5-87e9617d3071.png" width="250" />
</details>

### Got a question?

[Start a discussion](https://github.com/adamroyle/wodify-shortcuts/discussions) or [send an email](adam@royle.dev).

### It's not working!</summary>

If you get an error, try again! Sometimes Wodify is slow to respond. If it's still broken the following day, [open an issue](https://github.com/adamroyle/wodify-shortcuts/issues) or [send an email](adam@royle.dev).

### Thank you, can I buy you a coffee?

Why certainly! [Buy me a coffee](https://ko-fi.com/adamroyle) online or at the gym if you know me in person.

---

## API documentation

For those who want to customise their shortcuts for a specific reason.

### Get the workout for a specific date

```
POST https://adam.royle.dev/wodify/workout
```

**Params**

| Name           | Required |                                                        |
| -------------- | -------- | ------------------------------------------------------ |
| email          | Yes      | The email used to login to Wodify.                     |
| password       | Yes      | The password used to login to Wodify.                  |
| date           | Yes      | The date in ISO 8601 format.                           |
| include_warmup | No       | Set to "1" to include warmup sections. Default is "0". |
| include_extras | No       | Set to "1" to include extras sections. Default is "0". |

**Example**

```sh
curl https://adam.royle.dev/wodify/workout \
  --data email=email@example.com \
  --data password=YourPassword1 \
  --data date=2022-09-27 \
  --data include_warmup=1 \
  --data include_extras=1
```

---

### Get all workouts for a date range

```
POST https://adam.royle.dev/wodify/all-workouts
```

**Params**

| Name      | Required |                                          |
| --------- | -------- | ---------------------------------------- |
| email     | Yes      | The email used to login to Wodify.       |
| password  | Yes      | The password used to login to Wodify.    |
| dateStart | Yes      | The date in ISO 8601 format.             |
| dateEnd   | Yes      | The date in ISO 8601 format. (inclusive) |

**Example**

```sh
curl https://adam.royle.dev/wodify/all-workouts \
  --data email=email@example.com \
  --data password=YourPassword1 \
  --data dateStart=2022-09-27 \
  --data dateEnd=2022-10-01
```

---

### Sign in to the next available class on a specific date

```
POST https://adam.royle.dev/wodify/signin
```

**Params**

| Name          | Required |                                                                                                                                                            |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| email         | Yes      | The email used to login to Wodify.                                                                                                                         |
| password      | Yes      | The password used to login to Wodify.                                                                                                                      |
| date          | Yes      | The date in ISO 8601 format.                                                                                                                               |
| include_class | No       | Exclude classes without a matching title. Case-insensitive. **Allows partial matches.** Multiple supported with duplicate param or separated by a newline. |
| exclude_class | No       | Exclude classes with a matching title. Case-insensitive. **Allows partial matches.** Multiple supported with duplicate param or separated by a newline.    |

**Example**

```sh
curl https://adam.royle.dev/wodify/signin \
  --data email=email@example.com \
  --data password=YourPassword1 \
  --data date=2022-09-27 \
  --data include_class=crossfit
```

---

## For Developers

### Running scripts locally

As this projects uses TypeScript and ESM, you need to use `tsm` instead of `node` directly. It will generate [some warnings](https://github.com/lukeed/tsm/issues/12) but these can be ignored.

```sh
tsm scripts/login.ts email@example.com YourPassword1 2022-08-23
```

### Deploy to your own AWS account

This project uses the [serverless framework](https://www.serverless.com/framework/docs/getting-started) to deploy AWS Lambda functions.

Assuming you have installed `awscli` and are logged in, you should be able to deploy these functions to your AWS account.

```
git clone https://github.com/adamroyle/wodify-shortcuts
cd wodify-shortcuts
yarn
yarn sls deploy
```
