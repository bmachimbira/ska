pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "SDA App"

include(":app")
include(":core:common")
include(":core:network")
include(":core:database")
include(":core:datastore")
include(":core:designsystem")
include(":feature-sermons")
include(":feature-devotionals")
include(":feature-quarterlies")
include(":feature-chat")
