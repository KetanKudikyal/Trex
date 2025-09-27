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
      'lnbc100n1p5dssz7dqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5pdvk6numzewcnsg7s6ul3cv5jchgp9dqckl874ua57wk9rumnpsssp5xf6zcz4fhvs795dfmumtnftawzmlhxtn3zgge86vvpu53v2w3qws9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqmuzwwvqeq6c4cgdfw7jr0j56vjxtdr3amwm2eqeg6r5pv0x6hgw8gv8awtywfjuze8yf6x9xqhnfudpxt48a6cgjf8vxhs82sjmrt5gqjy4gm3',
    paymentHash:
      '0b596d4f9b165d89c11e86b9f8e194962e8095a0c5be7f579da79d628f9b9861',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / LiquidBridge',
    status: 'pending',
  },
  {
    id: '2',
    amount: 10,
    paymentRequest:
      'lnbc100n1p5dssrqdqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5wvf8s5cj0x03n3v5w4w58y0pwv9h8x4vlswd7d4wthn8jdksg7pssp5fgrmu5hj4fnn6ld5nvm79dydthqzakntjquc7dl949mdaxw534ms9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqgvj6yewynsv5hcxvjevdy8kaj8ndjs7vxhk69sdln2s23a5wvrxr5lrc2kvyhgxw9lw9nshx7wl7gdyyjxzd4acuf2aw5uj4c5xxrgcp5s2zp5',
    paymentHash:
      '7312785312799f19c594755d4391e1730b739aacfc1cdf36ae5de67936d04783',
    transactionHash: '-',
    description: 'CLH / ThunderPool',
    status: 'pending',
  },
  {
    id: '3',
    paymentRequest:
      'lnbc100n1p5dssrzdqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5rglq7qq2a6xhr3crk4et0htqwsrqv2mq0mcs8dcqhz07rczfn9vssp5pfhfzjuajhu3ndhcx53y40qmysc2wvg9hqfrmcz32eeryd8773mq9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjq3xj73w6udjt5q6wu38m54r7xy6h46sa9pes3km5y0jlxmz6cq0nhas9795k5vv2q9mawf68vauezsw0lclsa746m8n0ddgw9qkaudssq5u4wx6',
    paymentHash:
      '1a3e0f000aee8d71c703b572b7dd607406062b607ef103b700b89fe1e0499959',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / CitreaFlux',
    status: 'pending',
  },
  {
    id: '4',
    paymentRequest:
      'lnbc100n1p5dssrydqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5z5kntnnl08ejwa8dq0he53g4w67793676knnwavdrm40axvt0jrqsp5ex4gx3xku08v88x264e5lay5hzt7x5dtd7jf6a0h2u0um4wz2uqq9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjq78d46w48uezp4utpjtajla5dx47cw7anmr2ssxtxgfue0gx7rup5q5nqtjan0cq0nkcgsnlkyyng45v6srztxpf7hhk57fypd6mfg4cqw9zqrn',
    paymentHash:
      '152d35ce7f79f32774ed03ef9a451576bde2c75ed5a737758d1eeafe998b7c86',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / SwapStream',
    status: 'pending',
  },
  {
    id: '5',
    paymentRequest:
      'lnbc100n1p5dssrxdqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5ruhffgq3xnp3aqvztf4zhfl4ep4tlwl255vp75832n37vlrxmsvqsp5vgg4302gdu6k7pmnvnq8pz85u326dnktt2ahyqhlxp0g53kg0tuq9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqr5nluqlx9rh7fv0epxq3h9kx8yuj7tnpnn252j9sldgk0zxndjvkh8mkhk78qnf0xgh0gahmtan2wugya53jxvmpa3u832sm733azkgq8erycw',
    paymentHash:
      '1f2e94a01134c31e81825a6a2ba7f5c86abfbbeaa5181f50f154e3e67c66dc18',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / NodeNexus',
    status: 'pending',
  },
  {
    id: '6',
    paymentRequest:
      'lnbc100n1p5dssrgdqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5mlvxk7m77a3mw5jn8tlejnky5t2rqqksynly74t6y5tx968auwlqsp52hykpc87sjlz42f00dlj2pk0s8jayww3ql2anw256gcayvcwqg6q9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqpaz0fsuvxygjd7ujm6dgk3pn6jz06n3allzv9z4z4jvns2lqqljykxh26ckta3wt0hkztjun0vad2j3vz3z29qnptwng00y6hprhuacqjnlxd5',
    paymentHash:
      'dfd86b7b7ef763b752533aff994ec4a2d43002d024fe4f557a251662e8fde3be',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / CitreaSocial',
    status: 'pending',
  },
  {
    id: '7',
    paymentRequest:
      'lnbc100n1p5dssr2dqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5ykyk6v9644jwulwamadrq2ff30qs5yhz5jyq6fa2dcr7450jehaqsp56083h9h5mz9sdsj9cw9yj6v0l6n57dwm0p8urc9vymxgmhkfdwps9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjq99wxmhrv48seva9vlwjhljftdj0ehspsh352yapq67wzygc5ry3hl4hrplxqxeva0m6f4t93eud8w72p2s34ptexr2sy7v4t3xk5maqqdga5ze',
    paymentHash:
      '25896d30baad64ee7ddddf5a3029298bc10a12e2a4880d27aa6e07ead1f2cdfa',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / VoltVillage',
    status: 'pending',
  },
  {
    id: '8',
    paymentRequest:
      'lnbc100n1p5dssrtdqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp56ld3zhdaht3s554nvsm6433hc6ff8dqmht9neckjrgkzw7mh34kqsp5vjde0t6uc7v2acx8mff0p36dnwku668pmtkksddzynjjeapzj04q9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqfn292k8zwfgvsm3myvlmudpm9c7ss52u76n3gpxw23c2n30p204rqtcpchs6570ph9ydlhp4a74nwqugp5lckkrr56gxqwjxg49jttcqghmg63',
    paymentHash:
      'd7db115dbdbae30a52b36437aac637c69293b41bbacb3ce2d21a2c277b778d6c',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / FlashFlow',
    status: 'pending',
  },
  {
    id: '9',
    paymentRequest:
      'lnbc100n1p5dssrddqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5djkymp7nedn0ay5fw2pg2n5uaz98udc5u37s9gtjaae6tylfh03qsp5hxqc4u22cye9c2ll778tdlw7trzjjz3w2z7glxhy5ug3ldypv0aq9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjqk64lnf92x99spvqqrphhchtl7gtfgf3kxa0u3r5qp8agvdjdluvx5an5hth3vdfvzn7dxw98qlagjsw0emx62gqv260ff3rxvc57z9qq8hwdvp',
    paymentHash:
      '6cac4d87d3cb66fe92897282854e9ce88a7e3714e47d02a172ef73a593e9bbe2',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / ThunderSwap',
    status: 'pending',
  },
  {
    id: '10',
    paymentRequest:
      'lnbc100n1p5dssr0dqqnp4qg3swhjx35csgqnh79uktlxsq2qp3r2659ztqpvcv5nu7lsw0amucpp5zar5ppmwayylysafl2dxdpatt94l2vxku0t0qs07g99h6rt5w04qsp5r2umlx0stft9uqpjn7dwrzk2zna06hvj8nyp2rhqluaegfh7f02q9qyysgqcqpcxqyz5vqrzjqw9fu4j39mycmg440ztkraa03u5qhtuc5zfgydsv6ml38qd4azymlapyqqqqqqqzfsqqqqlgqqqq86qqjqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpmn5qqqqqqqqqqqqqq2qrzjqw963anm4rl4cjrkfnwny5wrxkvd2keqx4rdpz50pmyaek0j0cmrwr0wqcqqjrgqqqqqqqqpqqqq05qqjq8tvcpx2nmfas24a45rlh6tyucwg5svmhesatlr0zjugaezwh3qf48qv3ez3za77wpx43cukdazcyl63xgt0gskvr5hvhj2t26ttqnpcqy86pt0',
    paymentHash:
      '174740876ee909f243a9fa9a6687ab596bf530d6e3d6f041fe414b7d0d7473ea',
    transactionHash: '-',
    amount: 10,
    description: 'CLH / CitreaStream',
    status: 'pending',
  },
]
