<?php
$template = '
<!DOCTYPE html>
  <html>
    <head>
      <title>Welcome to Blather</title>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <style type="text/css">
        /* CLIENT-SPECIFIC STYLES */
        body,
        table,
        td,
        a {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        table,
        td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }

        /* RESET STYLES */
        img {
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
        }
        table {
          border-collapse: collapse !important;
        }
        body {
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
        }

        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
          color: inherit !important;
          text-decoration: none !important;
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
        }

        /* MEDIA QUERIES */
        @media screen and (max-width: 480px) {
          .mobile-hide {
            display: none !important;
          }
          .mobile-center {
            text-align: center !important;
          }
        }

        /* ANDROID CENTER FIX */
        div[style*="margin: 16px 0;"] {
          margin: 0 !important;
        }
      </style>
    </head>
    <body
      style="
        margin: 0 !important;
        padding: 0 !important;
        background-color: #eeeeee;
      "
      bgcolor="#eeeeee"
    >
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">
            <table
              align="center"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="max-width: 600px;"
            >
              <tr>
                <td
                  align="center"
                  valign="top"
                  style="font-size: 0; padding: 35px;"
                  bgcolor="15202b"
                >
                  <div
                    style="
                      display: inline-block;
                      max-width: 50%;
                      min-width: 100px;
                      vertical-align: top;
                      width: 100%;
                    "
                  >
                    <table
                      align="left"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                      style="max-width: 300px;"
                    >
                      <tr>
                        <td
                          align="center"
                          valign="top"
                          style="
                            font-family: Open Sans, Helvetica, Arial, sans-serif;
                            font-size: 36px;
                            font-weight: 800;
                            line-height: 48px;
                          "
                          class="mobile-center"
                        >
                          <h1
                            style="
                              font-size: 36px;
                              font-weight: 800;
                              margin: 0;
                              color: #ffffff;
                            "
                          >
                            <img
                              src="https://blather22.s3.amazonaws.com/icon-100x100.png"
                              width="50"
                              height="50"
                              style="border: 0px; vertical-align: middle;"
                            />
                          </h1>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
              <tr>
                <td
                  align="center"
                  style="padding: 35px; background-color: #ffffff;"
                  bgcolor="#ffffff"
                >
                  <table
                    align="center"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    style="max-width: 600px;"
                  >
                    <tr>
                      <td
                        align="left"
                        style="
                          font-family: Open Sans, Helvetica, Arial, sans-serif;
                          font-size: 16px;
                          font-weight: 400;
                          line-height: 24px;
                          padding-bottom: 15px;
                        "
                      >
                        <p
                          style="
                            font-size: 18px;
                            font-weight: 800;
                            line-height: 24px;
                            color: #333333;
                          "
                        >
                          Hi {NAME},
                        </p>
                        <p
                          style="
                            font-size: 16px;
                            font-weight: 400;
                            line-height: 24px;
                            color: #777777;
                          "
                        >
                          Welcome to
                          <a href="https://blather.io">Blather</a>.
                          Your verification code is: <b>{CODE}</b>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>';
?>