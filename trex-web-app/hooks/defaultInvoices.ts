export interface Invoice {
  id: string
  paymentRequest: string
  paymentHash: string
  transactionHash: string
  amount: number
  description: string
  status: 'paid' | 'failed' | 'pending'
}

export const defaultInvoices: Invoice[] = [
  {
    id: '1',
    paymentRequest:
      'lnbc100n1p5d3njmdqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5v28veefyu23dp27mtgqesa2xngu2ujl25lgr24xw5dgwx0q8gv9qsp5sjfpkwlc2u7uvsleyn8xg3lacn5l2anhdrxx3x0r0m0lx6m85mgq9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqv9q9avpvhk3ufu7mnmnlfa3pm6a2zy908v7zlmyaw9avwsw9d6q3t9a6t4h05zpkyhud948y5jtq00crvdhat6phpeqs7flag2de8uqqarf4qm',
    paymentHash:
      '628ecce524e2a2d0abdb5a019875469a38ae4beaa7d03554cea350e33c07430a',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / ThunderSwap',
    status: 'pending',
  },
  {
    id: '2',
    amount: 10,
    paymentRequest:
      'lnbc100n1p5d3njadqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5w6rveue0zqdah0cecem8k8z6awr7exf284z5ns0sx4epusl8d0vssp5cmqza82cy94z25v4d3yu2lmnu3nmclagsh5hy32tm26vmw80sf9s9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqva89rkrhlhnvzdz3yrsjta7fzfyup7mgufdahljest7xcpeykns4zu9am635xk6fjhexlym8td404p7ky7uhqlwhndnnfj3ahslpdwqphdh6l9',
    paymentHash:
      '7686ccf32f101bdbbf19c6767b1c5aeb87ec992a3d4549c1f035721e43e76bd9',
    transactionHash: '-',
    description: 'CLH / ThunderPool',
    status: 'pending',
  },
  {
    id: '3',
    paymentRequest:
      'lnbc100n1p5d3njldqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5vdtx7nwhtpprma9q6x3pzqzd4kewvu8hef2cp8dc6rhjqhcr8ywssp557rv25nes0jqgnr4egxaw0suh66ecankkkqrk88rprulyftl5s9s9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjq76y0578mnn6cwdm9353j83zc22236p6fud35qqjlakuujw9ht3uktvf4dj9lzaqe7ghku4d2r7lf85lsdr8v3vavs0u9rduq52sxqnspcrjupw',
    paymentHash:
      '63566f4dd758423df4a0d1a211004dadb2e670f7ca55809db8d0ef205f03391d',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / FlashFlow',
    status: 'pending',
  },
  {
    id: '4',
    paymentRequest:
      'lnbc100n1p5d3nnpdqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp58xdmaj3ht5fyaps3pmhsnawh9605ndlp0hr4987hzsw8ddl7gc8qsp5tag7rv3mpaurd5ef977u86a47mv98wtd7ylzayqan945zdvcdmgs9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqqdagd85ec5exlytxch9wj42qce8pkaacc93lau95n090umpk5t69gcmdzp297f3d7erp67spgw0ktju6s6wwd5whaxjlxyxapgej2rsqlhps7m',
    paymentHash:
      '399bbeca375d124e86110eef09f5d72e9f49b7e17dc7529fd7141c76b7fe460e',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / LiquidBridge',
    status: 'pending',
  },
  {
    id: '5',
    paymentRequest:
      'lnbc100n1p5d3nnzdqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5ax7yw6g9wjus28v96y0s9ywelmalwmny4jvgc8wf3xvkhuxgcwkssp5ermgyytumuw4gcak2an2gg9z0ck90juplyemwj23kpq4hhzjh7ps9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjq74gmkphfs74uwr6ay6kufj90m0ktsq40tljyxgle24dx77gqlp4s6s03mrmm4edqgscxd9wjvjgp6p83knf5wnlzwrad8trqja8h78gqxmktk7',
    paymentHash:
      'e9bc47690574b9051d85d11f0291d9fefbf76e64ac988c1dc989996bf0c8c3ad',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / ThunderSwap',
    status: 'pending',
  },
  {
    id: '6',
    paymentRequest:
      'lnbc100n1p5d3nnydqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5w9ls74qcxz33we399ux9azr0nyc0np9us4vas3w9ze5de2q7xwgssp52vz9e6tt379hte0cr6k5q3tgdy062yp8yt2j59sqrs5pjdzmluts9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqe2nj7hn5hznmzlsu6r860r2462q989mk97nkhy2rlt98c44v2a35jdj0n7txls38v5j4w20qffzl7e7ve5n66p7jfw5l2d3mke6yalcpvpcxqk',
    paymentHash:
      '717f0f541830a31766252f0c5e886f9930f984bc8559d845c51668dca81e3391',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / FlashFlow',
    status: 'pending',
  },
  {
    id: '7',
    paymentRequest:
      'lnbc100n1p5d3nn8dqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5rd3hdhlsvp82vn8cq292y6h6nh6gqcqkgwuhh86q8myqmk07g6uqsp584377tcyj2chsayhkw32ulrljlwv4zjjs2yyjadhsazkasa4068s9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqcqk3zm02yr2dr896380n7xhhme3pkl09aufvk8tslsnxtsr9hdvkshc6e5fll4905fxd4wsvarx2rkmr9e7549wh7qsee9emacsdkcgq0j77y3',
    paymentHash:
      '1b6376dff0604ea64cf8028aa26afa9df480601643b97b9f403ec80dd9fe46b8',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / VoltVillage',
    status: 'pending',
  },
  {
    id: '8',
    paymentRequest:
      'lnbc100n1p5d3nnfdqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5a7wkxamhr6mqeht8gyhwxnpsvda6dhchadaawgk6f90m9j09sarssp5kc7e9v5j9dl7adj7tq3eupq06lztc78qqtqc7j7sszyfgp46x9ls9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqrntxsqpdlhr65engpu7n99yqcvnqcllcxvgu623maxl5qcp633y4tu295a95tn5h3l5t6pklm49fjnt64zzyw4yl93fdp9r68wvuceqq9u9y84',
    paymentHash:
      'ef9d6377771eb60cdd67412ee34c30637ba6df17eb7bd722da495fb2c9e58747',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / NodeNexus',
    status: 'pending',
  },
]
