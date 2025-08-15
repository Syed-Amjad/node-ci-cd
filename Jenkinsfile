pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "node-ci-cd-demo"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'master', url: 'https://github.com/Syed-Amjad/node-ci-cd.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
            }
        }

        stage('Run Container (optional)') {
            steps {
                sh 'docker run -d -p 3000:3000 --name node-ci-cd $DOCKER_IMAGE || true'
            }
        }
    }

    post {
        failure {
            emailext(
                subject: "Jenkins Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """<p>Build failed for job: ${env.JOB_NAME}</p>
                         <p>Build Number: ${env.BUILD_NUMBER}</p>
                         <p>Check Jenkins for details: ${env.BUILD_URL}</p>""",
                to: 'your-email@example.com',
                mimeType: 'text/html'
            )
        }
    }
}

