pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '15'))
    }

    environment {
        IMAGE_NAME     = 'budget-bites'
        IMAGE_TAG      = "build-${BUILD_NUMBER}"
        TEST_CONTAINER = "budget-bites-ci-${BUILD_NUMBER}"
        TEST_PORT      = '8081'
    }

    stages {

        stage('Checkout') {
            steps {
                script {
                    def scmVars = checkout scm

                    env.GIT_SHORT = scmVars.GIT_COMMIT.take(7)
                    env.GIT_BRANCH_NAME = scmVars.GIT_BRANCH ?: 'main'
                }

                echo "Checked out ${env.GIT_BRANCH_NAME} at commit ${env.GIT_SHORT}"

                bat 'git log -1 --oneline'
            }
        }

        stage('Environment Check') {
            steps {
                echo 'Checking build environment...'

                bat 'git --version'
                bat 'docker --version'
                bat 'docker compose version'

                writeFile file: 'build-info.txt', text: """Application: Budget Bites
Build: ${BUILD_NUMBER}
Commit: ${GIT_SHORT}
Branch: ${GIT_BRANCH_NAME}
Image: ${IMAGE_NAME}:${IMAGE_TAG}
"""

                echo 'Build environment check passed'
            }
        }

        stage('Project Validation') {
            steps {
                script {

                    echo 'Checking project files...'

                    if (!fileExists('index (2).html')) {
                        error 'index (2).html is missing'
                    }

                    if (!fileExists('style.css')) {
                        error 'style.css is missing'
                    }

                    if (!fileExists('app (1).js')) {
                        error 'app (1).js is missing'
                    }

                    if (!fileExists('data (1).js')) {
                        error 'data (1).js is missing'
                    }

                    echo 'All project files found'

                    def html = readFile('index (2).html')

                    if (!html.toLowerCase().contains('<title>')) {
                        echo 'Warning: <title> tag not found'
                    }

                    echo 'HTML validation passed'
                }
            }
        }

        stage('Create Dockerfile') {
            steps {
                script {

                    writeFile file: 'Dockerfile', text: '''
FROM nginx:alpine

COPY index (2).html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY app (1).js /usr/share/nginx/html/app.js
COPY data (1).js /usr/share/nginx/html/data.js

EXPOSE 80
'''

                    echo 'Dockerfile created'
                }
            }
        }

        stage('Docker Build') {
            steps {

                echo "Building Docker image ${IMAGE_NAME}:${IMAGE_TAG}"

                bat "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."

                bat "docker image ls ${IMAGE_NAME}"
            }
        }

        stage('Container Test') {
            steps {

                bat(
                    script: "docker rm -f ${TEST_CONTAINER}",
                    returnStatus: true
                )

                echo "Starting Docker container..."

                bat "docker run -d --name ${TEST_CONTAINER} -p ${TEST_PORT}:80 ${IMAGE_NAME}:${IMAGE_TAG}"

                script {

                    echo 'Waiting for container...'

                    retry(5) {
                        sleep 2
                        bat "curl -f http://localhost:${TEST_PORT}/"
                    }

                    echo 'Application is running successfully'

                    echo "Testing Budget Bites..."

                    bat "curl -f http://localhost:${TEST_PORT}/"

                    echo 'Container test passed'
                }
            }
        }
    }

    post {

        always {
            bat(
                script: "docker rm -f ${TEST_CONTAINER}",
                returnStatus: true
            )
        }

        success {

            bat "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"

            echo "========================================"
            echo "PIPELINE SUCCESS"
            echo "========================================"
            echo "Docker Image:"
            echo "${IMAGE_NAME}:${IMAGE_TAG}"
            echo "${IMAGE_NAME}:latest"
            echo "Commit: ${GIT_SHORT}"
            echo "========================================"
        }

        failure {

            echo "========================================"
            echo "PIPELINE FAILED"
            echo "========================================"
            echo "Build: ${BUILD_NUMBER}"
            echo "Check the failed stage above."
            echo "========================================"
        }
    }
}
