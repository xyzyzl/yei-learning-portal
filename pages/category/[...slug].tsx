import React, { useEffect, useState } from 'react'
import {
  formatSlug,
  getAllFilesFrontMatter,
  getFileBySlug,
  getFiles,
} from '@/lib/mdx'
import routes, { kebabModules } from '@/data/routes'

import CategoryLayout from '@/components/category/CategoryLayout'
import FRQPage from '@/components/category/frq/FRQPage'
import Head from 'next/head'
import Layout from '@/components/global/Layout'
import { MDXLayoutRenderer } from '@/components/mdx/MDXComponents'
import { MDXRemote } from 'next-mdx-remote'
import { kebabCase } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/router'

export async function getStaticPaths() {
  const posts = await getFiles('content')
  routes.forEach((category) => {
    for (let i = 0; i < category.children.length; i++) {
      posts.push(
        `${kebabCase(category.name)}_${kebabCase(category.children[i])}_slides`
      )
      posts.push(
        `${kebabCase(category.name)}_${kebabCase(
          category.children[i]
        )}_mcq-practice`
      )
    }
  })
  // console.log(posts)
  return {
    paths: posts.map((p) => ({
      params: {
        slug: p.replace(/\.mdx/, '').replace(/\_/g, '/').split('/'),
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  let post
  // console.log(params.slug)
  if (params.slug[2] !== 'slides' && params.slug[2] !== 'mcq-practice') {
    post = await getFileBySlug('content', params.slug.join('_'))
  } else {
    post = { mdxSource: '', frontMatter: '' }
  }

  return { props: { post } }
}

export default function Category({ post }) {
  const auth = useAuth()
  const { mdxSource, frontMatter } = post
  const router = useRouter()
  const slug = router.query.slug || []

  const [sectionType, setSectionType] = useState('')

  useEffect(() => {
    setSectionType(slug[2])
  }, [router])

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.11.0/dist/katex.min.css"
          integrity="sha384-BdGj8xC2eZkQaxoQ8nSLefg4AV4/AwB3Fj+8SUSo7pnKP6Eoy18liIKTPn9oBYNG"
          crossOrigin="anonymous"
        />
      </Head>
      {auth.user ? (
        <Layout page={slug[0]} showNav={slug.length === 1}>
          <div className="w-full">
            {kebabModules.indexOf(sectionType) !== -1 ? (
              <CategoryLayout slug={slug} sectionType={sectionType}>
                {mdxSource !== '' && frontMatter !== '' ? (
                  <FRQPage slug={slug}>
                    <MDXLayoutRenderer
                      mdxSource={mdxSource}
                      frontMatter={frontMatter}
                      slug={slug}
                      auth={auth}
                    />
                  </FRQPage>
                ) : (
                  ''
                )}
              </CategoryLayout>
            ) : (
              ''
            )}
          </div>
        </Layout>
      ) : (
        ''
      )}
    </>
  )
}
