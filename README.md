# Sign into CrossFit (Wodify) using Siri

https://user-images.githubusercontent.com/25002779/193733401-108d7680-cace-4871-af75-717e0d7c6065.mp4

## How to install these shortcuts on your iPhone

<details><summary>

### Sign in when you arrive at the gym (using Location Services)</summary>

Never forget to sign in again! You can create a personal automation that will prompt you to sign in when you arrive at the gym.

<img src="https://user-images.githubusercontent.com/25002779/193749886-8b25137c-569f-4c7f-a953-5c7a03a8ec7d.png" width="250" />
<img src="https://user-images.githubusercontent.com/25002779/193749891-46bad621-1593-4d23-9b93-cc6e4686c20f.png" width="250" />
<img src="https://user-images.githubusercontent.com/25002779/193749894-19edfb84-4fa5-4d70-ac1f-76c199e77b2a.png" width="250" />
<img src="https://user-images.githubusercontent.com/25002779/193749895-499a9bf8-adeb-4a7b-bfc4-594aec18ff73.png" width="250" />
<img src="https://user-images.githubusercontent.com/25002779/193749897-28f9b530-a649-46bf-898b-4e9c697336ac.png" width="250" />
<img src="https://user-images.githubusercontent.com/25002779/193749898-c759f62c-5227-47cb-8981-9ef073a636b5.png" width="250" />
<img src="https://user-images.githubusercontent.com/25002779/193749900-d7afd777-91d4-46be-bae5-87e9617d3071.png" width="250" />

</details>

## Privacy Considerations

**Use these shortcuts at your own risk.** No responsibility will be taken if your Wodify account is compromised or account details exposed.

However, we take these steps to protect your personal information.

1. All data is encrypted using SSL while transmitted.
2. No personal information or security tokens are stored or logged in our system.
3. A truncated hash of your email is logged on each request (it looks something like `e42dc77f`). This allows tracking the number of unique users without saving your email address.

## API documentation

For those who want to customise their shortcuts for a specific reason.

---

### Get the workout for a specific date

```
POST https://adam.royle.dev/wodify/workout
```

**Params**

| Name            | Required |                                                                                                                                                                                                            |
| --------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| email           | Yes      | The email used to login to Wodify.                                                                                                                                                                         |
| password        | Yes      | The password used to login to Wodify.                                                                                                                                                                      |
| date            | Yes      | The date in ISO 8601 format.                                                                                                                                                                               |
| include_section | No       | Exclude sections without a matching title. Case-insensitive. **Allows partial matches.** Multiple supported with duplicate param or separated by a newline.                                                |
| exclude_section | No       | Exclude sections with a matching title. Case-insensitive. **Allows partial matches.** Will be ignored if `include_section` is provided. Multiple supported with duplicate param or separated by a newline. |

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

| Name          | Required |                                                                                                                                                                                                         |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| email         | Yes      | The email used to login to Wodify.                                                                                                                                                                      |
| password      | Yes      | The password used to login to Wodify.                                                                                                                                                                   |
| date          | Yes      | The date in ISO 8601 format.                                                                                                                                                                            |
| include_class | No       | Exclude classes without a matching title. Case-insensitive. **Allows partial matches.** Multiple supported with duplicate param or separated by a newline.                                              |
| exclude_class | No       | Exclude classes with a matching title. Case-insensitive. **Allows partial matches.** Will be ignored if `include_class` is provided. Multiple supported with duplicate param or separated by a newline. |

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
git clone https://github.com/adamroyle/wodify-api
cd wodify-api
yarn
yarn sls deploy
```
