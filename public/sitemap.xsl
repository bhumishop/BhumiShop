<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" indent="yes" encoding="UTF-8"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>BhumiShop - Sitemap</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem 1rem;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
          }
          .header h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }
          .header p {
            opacity: 0.9;
            font-size: 1.1rem;
          }
          .stats {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 1rem;
            flex-wrap: wrap;
          }
          .stat {
            background: rgba(255,255,255,0.2);
            padding: 0.5rem 1.5rem;
            border-radius: 8px;
          }
          .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
          }
          .stat-label {
            font-size: 0.85rem;
            opacity: 0.9;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          thead {
            background: #f8f9fa;
          }
          th {
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #e9ecef;
          }
          td {
            padding: 1rem;
            border-bottom: 1px solid #e9ecef;
          }
          tr:hover {
            background: #f8f9fa;
          }
          a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
          }
          a:hover {
            text-decoration: underline;
            color: #764ba2;
          }
          .priority-high { color: #28a745; font-weight: bold; }
          .priority-medium { color: #ffc107; font-weight: bold; }
          .priority-low { color: #6c757d; }
          .footer {
            padding: 1.5rem;
            text-align: center;
            background: #f8f9fa;
            color: #6c757d;
            font-size: 0.9rem;
          }
          @media (max-width: 768px) {
            table { font-size: 0.9rem; }
            th, td { padding: 0.75rem 0.5rem; }
            .header h1 { font-size: 1.5rem; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BhumiShop Sitemap</h1>
            <p>Bhumisparsha School Virtual Store</p>
            <div class="stats">
              <div class="stat">
                <div class="stat-value"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></div>
                <div class="stat-label">Total URLs</div>
              </div>
              <div class="stat">
                <div class="stat-value"><xsl:value-of select="count(sitemap:urlset/sitemap:url[sitemap:priority &gt;= 0.8])"/></div>
                <div class="stat-label">High Priority</div>
              </div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Priority</th>
                <th>Change Frequency</th>
                <th>Last Modified</th>
                <th>Languages</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <xsl:attribute name="class">
                      <xsl:choose>
                        <xsl:when test="sitemap:priority &gt;= 0.8">priority-high</xsl:when>
                        <xsl:when test="sitemap:priority &gt;= 0.5">priority-medium</xsl:when>
                        <xsl:otherwise>priority-low</xsl:otherwise>
                      </xsl:choose>
                    </xsl:attribute>
                    <xsl:value-of select="sitemap:priority"/>
                  </td>
                  <td><xsl:value-of select="sitemap:changefreq"/></td>
                  <td><xsl:value-of select="sitemap:lastmod"/></td>
                  <td><xsl:value-of select="count(xhtml:link)"/></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
          <div class="footer">
            <p>Generated on <xsl:value-of select="format-date(current-date(), '[D01] [MNn] [Y0001]')"/></p>
            <p>BhumiShop - Bhumisparsha School | contact@bhumisparshaschool.org</p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
