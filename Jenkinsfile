
pipeline {
    agent any

    environment {
        PROJECT_ID = 'devops-platform-513014'
        REGION = 'asia-south1'
        CLUSTER_NAME = 'self-healing-cluster'
        CLUSTER_ZONE = 'asia-south1-a'

        REPOSITORY = 'employee-api'
        IMAGE_NAME = 'employee-api'

        REGISTRY = "${REGION}-docker.pkg.dev"
        IMAGE_TAG = "${BUILD_NUMBER}"

        FULL_IMAGE = "${REGISTRY}/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('app') {
                    sh 'npm ci'
                }
            }
        }

        stage('Test') {
            steps {
                dir('app') {
                    sh 'npm test'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $FULL_IMAGE ./app'
            }
        }

        stage('Authenticate to GCP') {
            steps {
                sh '''
                    gcloud config set project $PROJECT_ID

                    gcloud auth configure-docker \
                      $REGISTRY --quiet
                '''
            }
        }

        stage('Push Image') {
            steps {
                sh 'docker push $FULL_IMAGE'
            }
        }

        stage('Deploy to GKE') {
            steps {
                sh '''
                    gcloud container clusters get-credentials \
                      $CLUSTER_NAME \
                      --zone $CLUSTER_ZONE \
                      --project $PROJECT_ID

                    kubectl set image deployment/employee-api \
                      employee-api=$FULL_IMAGE

                    kubectl rollout status deployment/employee-api \
                      --timeout=180s
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    kubectl get pods

                    kubectl get deployment employee-api
                '''
            }
        }
    }

    post {
        success {
            echo 'Deployment completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the Jenkins console output.'
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}
