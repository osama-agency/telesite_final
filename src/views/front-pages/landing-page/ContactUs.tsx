// React Imports
import { useEffect, useRef } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'

// Third-party Imports
import classnames from 'classnames'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useIntersection } from '@/hooks/useIntersection'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'
import styles from './styles.module.css'

const ContactUs = () => {
  // Refs
  const skipIntersection = useRef(true)
  const ref = useRef<null | HTMLDivElement>(null)

  // Hooks
  const { updateIntersections } = useIntersection()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (skipIntersection.current) {
          skipIntersection.current = false

          return
        }

        updateIntersections({ [entry.target.id]: entry.isIntersecting })
      },
      { threshold: 0.35 }
    )

    ref.current && observer.observe(ref.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section id='contact-us' className='plb-[100px] bg-backgroundDefault' ref={ref}>
      <div className={classnames('flex flex-col gap-16', frontCommonStyles.layoutSpacing)}>
        <div className='flex flex-col items-center justify-center gap-4'>
          <Chip size='small' variant='tonal' color='primary' label='Contact Us' />
          <div className='flex flex-wrap flex-col items-center justify-center gap-1 text-center'>
            <Typography variant='h4'>
              <span className='relative z-[1] font-extrabold'>
                Let&#39;s work
                <img
                  src='/images/front-pages/landing-page/bg-shape.png'
                  alt='bg-shape'
                  className='absolute block-end-0 z-[1] bs-[40%] is-[132%] -inline-start-[19%] block-start-[17px]'
                />
              </span>{' '}
              together
            </Typography>
            <Typography>Any question or remark? just write us a message</Typography>
          </div>
        </div>
        <div className='lg:pis-10'>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 6, lg: 5 }}>
              <div className={classnames('relative border p-[10px]', styles.contactRadius)}>
                <img
                  src='/images/front-pages/landing-page/contact-border.png'
                  className='absolute -block-start-[8.5%] -inline-start-[9%] max-is-full max-lg:hidden '
                  alt='contact-border'
                  width='191'
                />
                <img
                  src='/images/front-pages/landing-page/customer-service.png'
                  alt='customer-service'
                  className={classnames('is-full', styles.contactRadius)}
                />
                <div className='flex items-start justify-around flex-wrap gap-4 pli-4 pbs-4 pbe-1.5'>
                  <div className='flex items-center gap-3'>
                    <CustomAvatar variant='rounded' size={40} skin='light' color='primary'>
                      <i className='bx-envelope' />
                    </CustomAvatar>
                    <div>
                      <Typography>Email</Typography>
                      <Typography variant='h6'>example@gamil.com</Typography>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <CustomAvatar variant='rounded' size={40} skin='light' color='success'>
                      <i className='bx-phone-call' />
                    </CustomAvatar>
                    <div>
                      <Typography>Phone</Typography>
                      <Typography variant='h6'>+123 568 963</Typography>
                    </div>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 7 }}>
              <Card className='bs-full'>
                <CardContent>
                  <div className='flex flex-col gap-1 mbe-6'>
                    <Typography variant='h4'>Send a message</Typography>
                    <Typography>
                      If you would like to discuss anything related to payment, account, licensing, partnerships, or
                      have pre-sales questions, you&#39;re at the right place.
                    </Typography>
                  </div>
                  <form className='flex flex-col items-start gap-4'>
                    <div className='flex max-sm:flex-col gap-4 is-full'>
                      <CustomTextField fullWidth label='Full name' id='name-input' />
                      <CustomTextField fullWidth label='Email address' id='email-input' type='email' />
                    </div>
                    <CustomTextField fullWidth multiline rows={5} label='Message' id='message-input' />
                    <Button variant='contained'>Send Inquiry</Button>
                  </form>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      </div>
    </section>
  )
}

export default ContactUs
