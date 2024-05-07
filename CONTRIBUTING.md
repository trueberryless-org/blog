# Contribute

Anyone is allowed to create blog posts.

## Creating new content

To create new pages, go to the [blog folder](https://github.com/trueberryless-org/blog/tree/main/starlight/src/content/docs/blog).

1. Click `Add File` -> `Create New File` in the top right corner of the GitHub page.
2. The filename must end in `.md` or `.mdx` to work properly. If you are not sure which extension to choose, `.md` is recommended.
3. Add and edit this content as the first content in the new file:

    ```Markdown
    ---
    title: Cloud Computing with Azure
    date: 2023-07-24
    tags:
      - Development
    excerpt: A small excerpt of the blog post…
    authors:
      name: HiDeoo
      title: Starlight Aficionado
      picture: https://avatars.githubusercontent.com/u/494699
      url: https://hideoo.dev
    ---

    ## The problem with Azure

    Azure is ...
    ```

4. When you have finished creating the content of the new page, click `Commit changes...` at the top right of the page, choose a commit message and confirm your action again.
5. Press the `Create Pull Request` button and there you go.

## Fixing spelling mistakes

If you are browsing the site and see an spelling mistake, we would be very grateful if you could fix it. The process of fixing it is very simple, as you don't need to download the entire GitHub repository.

1. Scroll to the bottom of the page and click `✏️ Edit Page`.
2. Login to GitHub if necessary.
3. Click the ✏️ icon at the top right of the file view.
4. Click `Fork this repository`. This will create a copy of the repository `trueberryless-org/blog` and save it under your account (`{username}/blog`).
5. You should now see the edit view of the file, where you can fix the error you spotted earlier.
6. Click `Commit changes...` at the top right of the page, choose a commit message and confirm your action again.
7. Now all you need to do is spam the `Create pull request` button a few times, and that's it...

Soon after you submit your pull request, a maintainer will review it and merge it if everything is OK.
