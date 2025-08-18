pipeline {
  agent any
  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    disableConcurrentBuilds()
    skipDefaultCheckout(true)   // avoid double "Declarative: Checkout SCM"
  }
  environment {
    DOCKER_REPO = 'amjad835/node-hello-prod' // <-- change me
    APP_PORT = '3000'
  }
  triggers {
    githubPush()
  }

  stages {
    stage('Checkout') {
      steps {
        cleanWs()
        checkout scm
        script {
          env.GIT_SHORT = sh(script: "git rev-parse --short=7 HEAD", returnStdout: true).trim()
        }
      }
    }

    stage('Resolve version') {
      agent {
        docker {
          image 'node:20-alpine'
          args '-u root'
        }
      }
      steps {
        script {
          env.VERSION = sh(
            script: "node -p \"require('./package.json').version\"",
            returnStdout: true
          ).trim()
          env.IMAGE_TAG = "${env.VERSION}-${env.GIT_SHORT}"
          echo "Resolved VERSION=${env.VERSION}, IMAGE_TAG=${env.IMAGE_TAG}"
        }
      }
    }

    stage('Lint & test') {
      agent {
        docker {
          image 'node:20-alpine'
          args '-u root'
        }
      }
      steps {
        sh '''
          set -e
          npm ci
          npm run lint
          npm run test:ci
        '''
      }
      post {
        always {
          junit 'reports/junit.xml'
        }
      }
    }

    stage('Build image') {
      steps {
        sh """
          docker build \
            --build-arg APP_VERSION=${VERSION} \
            --build-arg COMMIT_SHA=${GIT_SHORT} \
            -t ${DOCKER_REPO}:${IMAGE_TAG} \
            -t ${DOCKER_REPO}:latest \
            .
        """
      }
    }

    stage('Security audit (quick)') {
      agent {
        docker {
          image 'node:20-alpine'
          args '-u root'
        }
      }
      steps {
        sh '''
          set -e
          npm ci --omit=dev
          npm audit --omit=dev --audit-level=high
        '''
      }
    }

    stage('Push image') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push ${DOCKER_REPO}:${IMAGE_TAG}
            docker push ${DOCKER_REPO}:latest
            docker logout || true
          '''
        }
      }
    }

    stage('Deploy to EC2') {
      steps {
        sh """
          set -e
          CONTAINER_NAME=node-hello-prod
          NEW_IMAGE=${DOCKER_REPO}:${IMAGE_TAG}

          docker rm -f $CONTAINER_NAME || true

          docker run -d --name $CONTAINER_NAME \
            --restart unless-stopped \
            --memory=256m --cpus=0.5 \
            -e NODE_ENV=production \
            -e APP_VERSION=${VERSION} \
            -p ${APP_PORT}:3000 \
            $NEW_IMAGE

          docker image prune -f || true
        """
      }
    }
  }

  post {
    success {
      echo "Deployed ${DOCKER_REPO}:${IMAGE_TAG} on EC2, reachable on port ${APP_PORT}"
    }
    failure {
      echo "Build failed. Check stages and logs."
    }
  }
}
