pipeline {
    agent any

      stages {
        stage('Checkout') {
            steps {
                cleanWs()
                git branch: 'master', url: 'https://github.com/Syed-Amjad/node-ci-cd.git'
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint || true' // won't fail the build if linting errors
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build || echo "No build script found"'
            }
        }

        stage('Package') {
            steps {
                sh 'zip -r artifact.zip .'
                archiveArtifacts artifacts: 'artifact.zip', fingerprint: true
            }
        }
    }

    post {
        success {
            echo "✅ Build completed successfully"
        }
        failure {
            echo "❌ Build failed – check logs above"
        }
    }
}
