envValue=$1
APP_NAME=$2
NAMESPACE=$3
IAS_TOKEN_ENDPOINT=$4
IAS_CLIENT_ID=$5
IAS_CLIENT_SECRET=$6
IAS_JWKS_ENDPOINT=$7
S3_ACCESS_KEY_ID=$8
S3_SECRET_ACCESS_KEY=$9
S3_BUCKET="${10}"
S3_REGION="${11}"
TZVALUE="America/Vancouver"

echo Creating config map "$APP_NAME"-config-map
oc create -n "$NAMESPACE"-"$envValue" configmap "$APP_NAME"-config-map --from-literal=TZ=$TZVALUE --from-literal=IAS_CLIENT_SECRET="$IAS_CLIENT_SECRET" --from-literal=IAS_CLIENT_ID="$IAS_CLIENT_ID" --from-literal=IAS_TOKEN_ENDPOINT="$IAS_TOKEN_ENDPOINT" --from-literal=S3_REGION="$S3_REGION" --from-literal=S3_ACCESS_KEY_ID="$S3_ACCESS_KEY_ID" --from-literal=S3_SECRET_ACCESS_KEY="$S3_SECRET_ACCESS_KEY" --from-literal=S3_BUCKET="$S3_BUCKET" --from-literal=IAS_JWKS_ENDPOINT="$IAS_JWKS_ENDPOINT" --from-literal=LOG_LEVEL=info --from-literal=BODY_LIMIT="50MB" --dry-run -o yaml | oc apply -f -

echo
echo Setting environment variables for "$APP_NAME-master" application
oc -n "$NAMESPACE-$envValue" set env --from=configmap/"$APP_NAME"-config-map deployment/"$APP_NAME-master"