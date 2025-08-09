#!/usr/bin/env pwsh

java -jar ./vendor/openapi-generator/openapi-generator-cli.jar generate `
    -i http://localhost:5000/openapi.json `
    -g typescript-fetch `
    -o . `
    --global-property apis,models,supportingFiles,apiDocs=false,modelDocs=false,apiTests=false,modelTests=false `
    --additional-properties=modelPackage=models,apiPackage=api,npmName=tribufu,prettier=true,sourceFolder=src,useSingleRequestParameter=false `
    --openapi-normalizer SET_TAGS_FOR_ALL_OPERATIONS=TribufuGenerated `
    --skip-validate-spec
