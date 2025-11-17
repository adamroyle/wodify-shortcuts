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
| include_scaled | No       | Set to "1" to include scaled workouts. Default is "0". |

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
| date          | Yes      | The date or date/time in ISO 8601 format. If no time is specified, it will default to current Australia/Brisbane time.                                     |
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

If you want to specify a time:

```sh
curl https://adam.royle.dev/wodify/signin \
  --data email=email@example.com \
  --data password=YourPassword1 \
  --data date=2022-09-27T16:30:00 \
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
