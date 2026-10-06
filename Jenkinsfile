pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '15'))
    }

    triggers {
        pollSCM('H/2 * * * *')
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

        stage('Build') {
            steps {
                echo 'Preparing Budget Bites for Docker packaging'

                bat 'git --version'
                bat 'docker --version'
                bat 'docker compose version'

                writeFile file: 'build-info.txt', text: """Application: Budget Bites
Build: ${BUILD_NUMBER}
Commit: ${GIT_SHORT}
Branch: ${GIT_BRANCH_NAME}
Image: ${IMAGE_NAME}:${IMAGE_TAG}
"""

                echo 'build-info.txt created'
            }
        }

        stage('Test / Validate') {
            steps {
                script {

                    echo 'Checking required project files...'

                    def required = [
                        'index.html',
                        'style.css',
                        'app.js',
                        'data.js',
                        'Dockerfile'
                    ]

                    def missing = []

                    for (f in required) {
                        if (!fileExists(f)) {
                            missing.add(f)
                        }
                    }

                    if (missing.size() > 0) {
                        error "Validation failed - missing files: ${missing.join(', ')}"
                    }

                    echo "All required files are present"

                    // Check HTML
                    def html = readFile('index.html')

                    if (!html.toLowerCase().contains('<title>')) {
                        error 'Validation failed - index.html has no <title>'
                    }

                    if (!html.contains('style.css')) {
                        error 'Validation failed - index.html does not reference style.css'
                    }

                    if (!html.contains('app.js')) {
                        error 'Validation failed - index.html does not reference app.js'
                    }

                    if (!html.contains('data.js')) {
                        error 'Validation failed - index.html does not reference data.js'
                    }

                    echo 'HTML validation passed'

                    // Check Dockerfile
                    def dockerfile = readFile('Dockerfile')

                    if (!dockerfile.toLowerCase().contains('nginx')) {
                        error 'Validation failed - Dockerfile must use nginx'
                    }

                    if (!dockerfile.contains('EXPOSE 80')) {
                        error 'Validation failed - Dockerfile must expose port 80'
                    }

                    echo 'Dockerfile validation passed'
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

                // Remove old container if it exists
                bat(
                    script: "docker rm -f ${TEST_CONTAINER}",
                    returnStatus: true
                )

                echo "Starting test container..."

                bat "docker run -d --name ${TEST_CONTAINER} -p ${TEST_PORT}:80 ${IMAGE_NAME}:${IMAGE_TAG}"

                script {

                    echo 'Waiting for container...'

                    retry(5) {

                        sleep 2

                        bat "curl -f http://localhost:${TEST_PORT}/"
                    }

                    echo 'Container is serving the application'

                    bat "curl -f http://localhost:${TEST_PORT}/build-info.txt"

                    echo "Container test passed"
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

            script {
                currentBuild.description =
                    "${IMAGE_NAME}:${IMAGE_TAG} (${GIT_SHORT})"
            }

            echo "========================================"
            echo "PIPELINE SUCCESS"
            echo "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
            echo "Image: ${IMAGE_NAME}:latest"
            echo "Commit: ${GIT_SHORT}"
            echo "========================================"
        }

        failure {
            echo "========================================"
            echo "PIPELINE FAILED"
            echo "Build: ${BUILD_NUMBER}"
            echo "Check the failed stage and console output."
            echo "========================================"
        }
    }
}
