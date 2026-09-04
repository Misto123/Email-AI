Build a Cloudflare-based deployment and website management system for this project.

The goal is to use this single project/repository as the source code for multiple websites. Each website should run on Cloudflare Workers and be independently configurable, while sharing the same application/codebase.

## Core concept:

SOURCE PROJECT
→ shared application/code
→ shared templates/components
→ shared functionality
→ website-specific configuration/content
→ individual Cloudflare Worker deployment
→ individual domain

Do NOT create a separate codebase for every website.

## Cloudflare deployment

Use Cloudflare Workers as the hosting/runtime environment.

The system must be able to:

- Create/manage Cloudflare Workers
- Deploy the current project to a Worker
- Connect a custom domain to a Worker
- Deploy updates to existing websites
- Redeploy a specific website when required
- View deployment status
- View deployment errors/logs where Cloudflare makes them available
- Manage multiple websites from the same project
- Avoid unnecessary deployments when nothing relevant changed

Cloudflare credentials/configuration must be stored securely using environment variables/secrets.

Never hardcode API tokens, account IDs or other credentials.

## Multi-site architecture

Create a concept of a "Site".

Each site should have its own configuration, for example:

- site ID
- domain
- Cloudflare Worker name
- site name
- language
- locale
- content configuration
- SEO configuration
- affiliate configuration
- branding configuration
- enabled/disabled status
- deployment status
- last deployment
- deployment version/commit
- created/updated timestamps

The important principle is:

ONE CODEBASE
MANY SITES

For example:

```
Project
├── Site A → example.com → Worker A
├── Site B → example.net → Worker B
├── Site C → example.org → Worker C
└── Site D → example.co.uk → Worker D
```

All sites use the same application code but can have different content/configuration.

## Site configuration

Do not hardcode individual websites into the application.

The application should determine which site is being served based on the incoming hostname/domain.

For example:

```
example.com
→ load Site A configuration

example.net
→ load Site B configuration

example.org
→ load Site C configuration
```

The site configuration should determine what content, branding, SEO data, affiliate links, offers, etc. are displayed.

Design this so adding a new website does NOT require modifying the application code.

## Content

All website content should originate from this project/system.

Separate:

- application/code
- site configuration
- content/data

Do not create duplicated application code for individual websites.

The architecture should make it possible to update shared functionality once and then deploy the change to multiple websites.

## Deployment workflow

Implement a deployment abstraction/service.

The system should support:

- createSite()
- deploySite()
- redeploySite()
- deleteSite()
- getSiteStatus()
- getDeploymentStatus()
- listSites()

A deployment should:

- Validate site configuration
- Validate required environment variables
- Build the application
- Deploy to Cloudflare Workers
- Configure/update the Worker
- Configure the custom domain if required
- Verify deployment
- Store deployment status/result
- Report errors clearly

Do not automatically delete production resources if a deployment fails.

## Admin interface

Create an admin interface for managing websites.

The admin should show:

**Sites**

- Domain
- Site name
- Status
- Worker name
- Last deployment
- Deployment status
- Current version/commit

**Actions:**

- Add site
- Edit site
- Deploy
- Redeploy
- View deployment status
- View logs/errors
- Disable site
- Delete site

For deployment actions, show clear progress and errors.

## Git integration

The Git repository should be the source of truth for application code.

A deployment should be associated with a Git commit SHA/version.

Store:

- commit SHA
- deployment timestamp
- site
- Cloudflare Worker
- deployment result

This makes it possible to determine exactly which version each website is running.

## Shared vs site-specific configuration

Clearly separate:

**GLOBAL CONFIGURATION**

Examples:

- application settings
- shared components
- deployment configuration
- Cloudflare configuration

**SITE CONFIGURATION**

Examples:

- domain
- site name
- logo
- colors
- language
- SEO defaults
- affiliate links
- offers
- content
- tracking IDs

Do not mix these unnecessarily.

## Database

If the existing project uses Supabase, use Supabase for site/deployment metadata rather than introducing another database.

Create appropriate tables for:

- sites
- site_config
- deployments

Use sensible relationships and indexes.

Do not store Cloudflare API secrets in the database unless there is a strong security reason and they are properly encrypted. Prefer environment variables/secrets.

## Cloudflare API

Create a clean Cloudflare service layer.

Do not scatter Cloudflare API calls throughout the application.

For example:

```
lib/cloudflare/
  client
  workers
  domains
  deployments
```

The rest of the application should communicate with this service layer rather than directly calling Cloudflare APIs.

## Local development

The application must remain easy to run locally.

Provide a development mode where a hostname/site can be selected without requiring a production Cloudflare deployment.

For example:

```
SITE_ID=site-a
```

or an equivalent mechanism.

## Production safety

This system will manage real websites.

Therefore:

- Never delete a Worker without explicit confirmation
- Never delete a production domain automatically
- Never overwrite unrelated sites
- Validate the target site before deployment
- Clearly display which domain/Worker is being modified
- Do not expose Cloudflare credentials
- Do not automatically spend money or upgrade Cloudflare resources
- Do not make destructive infrastructure changes without explicit confirmation

## Architecture principles

Keep the implementation simple.

Prefer:

- existing project architecture
- existing framework
- Cloudflare Workers
- Supabase if already present
- TypeScript
- small reusable services
- clear separation between application, site configuration and deployment

Avoid introducing unnecessary infrastructure.

Do not build Kubernetes, Docker orchestration, a separate deployment server, or another hosting platform unless technically required.

## Important future requirement

The architecture must eventually allow me to manage potentially hundreds of websites from the same project.

Therefore, do not build the system around the assumption that there is only one website.

However, do not over-engineer it now.

Start with a clean architecture that supports:

```
1 project
→ many sites
→ many Cloudflare Workers
→ many domains
```

## First implementation phase

Before writing substantial code:

1. Inspect the existing project.
2. Identify the current framework/build system.
3. Identify how content is currently stored.
4. Identify whether Supabase is already being used.
5. Identify the current deployment configuration.
6. Determine the correct Cloudflare Workers architecture for this project.
7. Explain the proposed architecture.
8. Identify any changes required to the existing application.
9. Then implement the system incrementally.

Do not rewrite the existing application unnecessarily.

At the end, provide:

- architecture summary
- files created/modified
- database changes
- required environment variables
- Cloudflare setup requirements
- deployment instructions
- local development instructions
- remaining limitations

## The most important requirement is:

**THIS MUST BE A MULTI-SITE PLATFORM.**

The current repository is the shared source code. Individual websites are configurations/content instances running on Cloudflare Workers. A change to the shared application should be deployable to multiple sites without maintaining separate codebases.
