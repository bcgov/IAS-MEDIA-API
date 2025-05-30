envValue=$1
APP_NAME=$2
NAMESPACE=$3
IAS_TOKEN_ENDPOINT=$4
IAS_CLIENT_ID=$5
IAS_CLIENT_SECRET=$6
IAS_JWKS_ENDPOINT=$7
TZVALUE="America/Vancouver"

echo Creating config map "$APP_NAME"-config-map
oc create -n "$NAMESPACE"-"$envValue" configmap "$APP_NAME"-config-map --from-literal=TZ=$TZVALUE --from-literal=JWKS_URL="$IAS_JWKS_ENDPOINT" --from-literal=LOG_LEVEL=info --from-literal=BODY_LIMIT="50MB" --dry-run -o yaml | oc apply -f -

echo
echo Setting environment variables for "$APP_NAME-master" application
oc -n "$NAMESPACE-$envValue" set env --from=configmap/"$APP_NAME"-config-map deployment/"$APP_NAME-master"