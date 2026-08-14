# Cloud Run Deploy

API は GitHub Actions から Cloud Run にデプロイします。認証は Workload Identity Federation を使い、サービスアカウントキー JSON は使いません。

## Required Values

Supabase:

```text
DB_HOST=db.bklngnttcequmywufkvf.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_NAME=postgres
DB_SSLMODE=require
SUPABASE_URL=https://bklngnttcequmywufkvf.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
SUPABASE_STORAGE_BUCKET=ads
CORS_ALLOWED_ORIGINS=https://<frontend-domain>
```

Google Cloud:

```text
GCP_PROJECT_ID=<project-id>
GCP_REGION=asia-northeast1
CLOUD_RUN_SERVICE=kurobasu-api
ARTIFACT_REGISTRY_REPOSITORY=kurobasu
```

## Google Cloud Setup

```bash
export PROJECT_ID=<project-id>
export PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
export REGION=asia-northeast1
export REPO=kurobasu
export SERVICE=kurobasu-api
export DEPLOY_SA=github-cloud-run-deployer
export RUNTIME_SA=kurobasu-api-runtime
export GITHUB_REPO=<owner>/<repo>

gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  iamcredentials.googleapis.com \
  secretmanager.googleapis.com \
  --project "$PROJECT_ID"

gcloud artifacts repositories create "$REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --project "$PROJECT_ID"

gcloud iam service-accounts create "$DEPLOY_SA" --project "$PROJECT_ID"
gcloud iam service-accounts create "$RUNTIME_SA" --project "$PROJECT_ID"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${DEPLOY_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${DEPLOY_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud iam service-accounts add-iam-policy-binding \
  "${RUNTIME_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project "$PROJECT_ID" \
  --member="serviceAccount:${DEPLOY_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

Secrets:

```bash
printf '%s' '<supabase-db-password>' | gcloud secrets create kurobasu-db-password \
  --data-file=- \
  --project "$PROJECT_ID"

printf '%s' '<supabase-secret-key>' | gcloud secrets create kurobasu-supabase-service-role-key \
  --data-file=- \
  --project "$PROJECT_ID"

gcloud secrets add-iam-policy-binding kurobasu-db-password \
  --project "$PROJECT_ID" \
  --member="serviceAccount:${RUNTIME_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding kurobasu-db-password \
  --project "$PROJECT_ID" \
  --member="serviceAccount:${DEPLOY_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding kurobasu-supabase-service-role-key \
  --project "$PROJECT_ID" \
  --member="serviceAccount:${RUNTIME_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding kurobasu-supabase-service-role-key \
  --project "$PROJECT_ID" \
  --member="serviceAccount:${DEPLOY_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Workload Identity Federation:

```bash
gcloud iam workload-identity-pools create github \
  --project="$PROJECT_ID" \
  --location=global \
  --display-name="GitHub Actions"

gcloud iam workload-identity-pools providers create-oidc github \
  --project="$PROJECT_ID" \
  --location=global \
  --workload-identity-pool=github \
  --display-name="GitHub Actions Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository == '${GITHUB_REPO}'"

gcloud iam service-accounts add-iam-policy-binding \
  "${DEPLOY_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github/attribute.repository/${GITHUB_REPO}"
```

## GitHub Variables

Repository Settings > Secrets and variables > Actions > Variables:

```text
GCP_PROJECT_ID=<project-id>
GCP_REGION=asia-northeast1
GCP_WORKLOAD_IDENTITY_PROVIDER=projects/<project-number>/locations/global/workloadIdentityPools/github/providers/github
GCP_DEPLOY_SERVICE_ACCOUNT=github-cloud-run-deployer@<project-id>.iam.gserviceaccount.com
CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT=kurobasu-api-runtime@<project-id>.iam.gserviceaccount.com
CLOUD_RUN_SERVICE=kurobasu-api
ARTIFACT_REGISTRY_REPOSITORY=kurobasu

DB_HOST=db.bklngnttcequmywufkvf.supabase.co
DB_USER=postgres
DB_NAME=postgres
DB_PASSWORD_SECRET_NAME=kurobasu-db-password

SUPABASE_URL=https://bklngnttcequmywufkvf.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY_SECRET_NAME=kurobasu-supabase-service-role-key
SUPABASE_STORAGE_BUCKET=ads
SUPABASE_STORAGE_PUBLIC_BASE_URL=
CORS_ALLOWED_ORIGINS=https://<frontend-domain>
```

`SUPABASE_SERVICE_ROLE_KEY` と DB password は GitHub Variables / Secrets に直接入れず、Google Secret Manager に置きます。
