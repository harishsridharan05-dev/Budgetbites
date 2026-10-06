// Jenkinsfile - Budget Bites
// Sprint 08: Continuous Integration using Jenkins
//
// Pipeline: Checkout -> Build -> Test / Validate -> Docker Build -> Container Test -> Post / Result
// Works on a Windows Jenkins agent (bat) and on a Linux agent such as AWS EC2 (sh).

// ---- Small helpers so the same pipeline runs on Windows and Linux ----
def run(String command) {
    if (isUnix()) { sh command } else { bat command }
}

def runStatus(String command) {
    return isUnix() ? sh(script: command, returnStatus: true)
                    : bat(script: command, returnStatus: true)
}

def runOutput(String command) {
    return isUnix() ? sh(script: command, returnStdout: true).trim()
                    : bat(script: "@${command}", returnStdout: true).trim()
}

pipeline {
    agent any

    options {
        skipDefaultCheckout(true)              // the Checkout stage does it explicitly
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '15'))
    }

    triggers {
        // Check the GitHub repository for new commits about every 2 minutes
        pollSCM('H/2 * * * *')
    }

    environment {
        IMAGE_NAME     = 'budget-bites'
        IMAGE_TAG      = "build-${env.BUILD_NUMBER}"
        TEST_CONTAINER = "budget-bites-ci-${env.BUILD_NUMBER}"
        TEST_PORT      = '8081'                // 8080 is used by the Sprint 7 container
    }

    stages {

        stage('Checkout') {
            steps {
                script {
                    def scmVars = checkout scm
                    env.GIT_SHORT       = scmVars.GIT_COMMIT.take(7)
                    env.GIT_BRANCH_NAME = scmVars.GIT_BRANCH ?: 'main'
                }
                echo "Checked out ${env.GIT_BRANCH_NAME} at commit ${env.GIT_SHORT}"
                run 'git log -1 --oneline'
            }
        }

        stage('Build') {
            steps {
                echo 'Preparing the Budget Bites static frontend for packaging'
                run 'git --version'
                run 'docker --version'
                run 'docker compose version'
                writeFile file: 'build-info.txt', text: """Application: Budget Bites
Build: ${env.BUILD_NUMBER}
Commit: ${env.GIT_SHORT}
Branch: ${env.GIT_BRANCH_NAME}
Image: ${env.IMAGE_NAME}:${env.IMAGE_TAG}
"""
                echo 'build-info.txt created (it is packaged into the image)'
            }
        }

        stage('Test / Validate') {
            steps {
                script {
                    // 1. Required project files must exist
                    def required = ['index.html', 'css/style.css', 'js/app.js', 'js/data.js',
                                    'Dockerfile', 'compose.yaml']
                    def missing = []
                    for (f in required) {
                        if (!fileExists(f)) { missing.add(f) }
                    }
                    if (missing.size() > 0) {
                        error "Validation failed - missing files: ${missing.join(', ')}"
                    }
                    echo "All ${required.size()} required files are present"

                    // 2. index.html must link the stylesheet and both scripts
                    def html = readFile('index.html')
                    for (asset in ['style.css', 'app.js', 'data.js']) {
                        if (!html.contains(asset)) {
                            error "Validation failed - index.html does not reference ${asset}"
                        }
                    }
                    if (!html.toLowerCase().contains('<title>')) {
                        error 'Validation failed - index.html has no <title>'
                    }
                    echo 'index.html links style.css, app.js and data.js'

                    // 3. Dockerfile must match the Sprint 7 Nginx setup
                    def dockerfile = readFile('Dockerfile')
                    if (!dockerfile.contains('FROM nginx') || !dockerfile.contains('EXPOSE 80')) {
                        error 'Validation failed - Dockerfile must use an nginx base image and expose port 80'
                    }
                    echo 'Dockerfile checks passed'
                }
                // 4. compose.yaml must be valid
                run 'docker compose config --quiet'
                echo 'compose.yaml is valid'
            }
        }

        stage('Docker Build') {
            steps {
                run "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                run "docker image ls ${IMAGE_NAME}"
            }
        }

        stage('Container Test') {
            steps {
                runStatus "docker rm -f ${TEST_CONTAINER}"
                run "docker run -d --name ${TEST_CONTAINER} -p ${TEST_PORT}:80 ${IMAGE_NAME}:${IMAGE_TAG}"
                script {
                    def page = ''
                    retry(5) {
                        sleep 2
                        page = runOutput("curl -s -f http://localhost:${TEST_PORT}/")
                    }
                    if (!page.contains('Budget')) {
                        error 'Container test failed - the Budget Bites page did not load'
                    }
                    def info = runOutput("curl -s -f http://localhost:${TEST_PORT}/build-info.txt")
                    if (!info.contains("Build: ${env.BUILD_NUMBER}")) {
                        error 'Container test failed - the container is not serving this build'
                    }
                    echo "Container test passed: http://localhost:${TEST_PORT} serves build ${env.BUILD_NUMBER}"
                }
            }
        }
    }

    post {
        always {
            script { runStatus "docker rm -f ${env.TEST_CONTAINER}" }
        }
        success {
            // Only a build that passed every stage becomes "latest"
            script { run "docker tag ${env.IMAGE_NAME}:${env.IMAGE_TAG} ${env.IMAGE_NAME}:latest" }
            script { currentBuild.description = "${env.IMAGE_NAME}:${env.IMAGE_TAG} (${env.GIT_SHORT})" }
            echo "PIPELINE SUCCESS: ${env.IMAGE_NAME}:${env.IMAGE_TAG} built, verified and tagged latest (commit ${env.GIT_SHORT})"
        }
        failure {
            echo "PIPELINE FAILED in build #${env.BUILD_NUMBER}. Open the red stage and read its console output."
        }
    }
}
