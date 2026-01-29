document.addEventListener('DOMContentLoaded', () => {
    const silverPriceInput = document.getElementById('silverPrice');
    const salaryInput = document.getElementById('salary');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultCard = document.getElementById('resultCard');
    const actionButtons = document.getElementById('actionButtons');

    // Outputs
    const silverAmountDisplay = document.getElementById('silverAmount');
    const silverAmountText = document.getElementById('silverAmountText');
    const resultEmoji = document.getElementById('resultEmoji');
    const rankAvatar = document.getElementById('rankAvatar');
    const rankTitle = document.getElementById('rankTitle');
    const rankDesc = document.getElementById('rankDesc');
    const qrcodeDiv = document.getElementById('qrcode');
    const saveBtn = document.getElementById('saveBtn');

    // Tiers Data
    const tiers = [
        { max: 2, title: '乞丐/流民', desc: '温饱都是问题，太难了...', emoji: '😭', img: 'assets/avatar_beggar.png' },
        { max: 10, title: '衙役/差役', desc: '勉强糊口，由于工时太长，没有加班费', emoji: '😐', img: 'assets/avatar_runner.png' },
        { max: 50, title: '县令', desc: '七品芝麻官，也是一方父母官', emoji: '🙂', img: 'assets/avatar_magistrate.png' },
        { max: 150, title: '知府/高官', desc: '朝廷重臣，位高权重', emoji: '😎', img: 'assets/avatar_prefect.png' },
        { max: Infinity, title: '王爷/皇亲国戚', desc: '泼天富贵，享之不尽', emoji: '🤑', img: 'assets/avatar_minister.png' }
    ];

    // Calculate Function
    calculateBtn.addEventListener('click', () => {
        const price = parseFloat(silverPriceInput.value);
        const salary = parseFloat(salaryInput.value);

        if (!price || !salary || price <= 0 || salary <= 0) {
            alert('请输入有效的银价和月薪！');
            return;
        }

        // 1 Liang = 50g
        const silverWeight = salary / price / 50;
        const silverFormatted = silverWeight.toFixed(2);

        // Update UI
        silverAmountDisplay.textContent = silverFormatted;
        silverAmountText.textContent = silverFormatted;

        // Determine Tier
        const tier = tiers.find(t => silverWeight < t.max);

        resultEmoji.textContent = tier.emoji;
        rankTitle.textContent = tier.title;
        rankDesc.textContent = tier.desc;
        rankAvatar.src = tier.img;
        // Fallback if image not found (for dev)
        rankAvatar.onerror = function () {
            this.src = 'https://via.placeholder.com/150?text=' + tier.title;
        };

        // QR Code
        qrcodeDiv.innerHTML = '';
        new QRCode(qrcodeDiv, {
            text: window.location.href,
            width: 100,
            height: 100,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // Show Result
        resultCard.style.display = 'block';
        actionButtons.style.display = 'flex';

        // Scroll to result
        resultCard.scrollIntoView({ behavior: 'smooth' });
    });

    // Validations
    [silverPriceInput, salaryInput].forEach(input => {
        input.addEventListener('input', () => {
            if (input.value < 0) input.value = 0;
        });
    });

    // Save Image
    saveBtn.addEventListener('click', () => {
        html2canvas(document.querySelector("#resultCard"), {
            scale: 2, // Higher resolution
            useCORS: true,
            backgroundColor: "#ffffff"
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = '古代身价.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    });

    // Share Button Logic
    const shareBtn = document.getElementById('shareBtn');
    shareBtn.addEventListener('click', () => {
        // Visual feedback
        const originalText = shareBtn.textContent;
        shareBtn.textContent = '生成中...';

        html2canvas(document.querySelector("#resultCard"), {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff"
        }).then(canvas => {
            canvas.toBlob(blob => {
                const file = new File([blob], "ancient_salary.png", { type: "image/png" });

                // Check if Web Share API is supported and can share files
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    navigator.share({
                        files: [file],
                        title: '古代俸禄计算器',
                        text: '来看看你的月薪在古代是什么官职！'
                    }).catch(err => console.log('分享取消', err));
                } else {
                    // Fallback for Desktop or unsupported browsers
                    alert('电脑端或当前浏览器不支持直接调用分享。\n请点击左侧“保存到手机”按钮，保存图片后手动分享。');
                }
                shareBtn.textContent = originalText;
            });
        }).catch(err => {
            console.error(err);
            alert('生成分享图片失败');
            shareBtn.textContent = originalText;
        });
    });
});
