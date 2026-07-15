$f = "c:\Users\Pranay Bhujade\Downloads\HIT.ai-repository\_next\static\chunks\3234-5557adf5fa4510d4.js"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

$modal = $c.IndexOf("Choose a property")
Write-Host "Modal subtitle at: $modal"
if ($modal -ge 0) { Write-Host $c.Substring($modal - 30, 120) }

# Check "Navigate to Property" - should be GONE (we changed it to "Get Directions")
$old = $c.IndexOf("Navigate to Property")
Write-Host "Old modal title: $old (should be -1)"

# Check for any stray single-quote or broken string
$em = $c.IndexOf(" — ")   # em dash check  
Write-Host "Em dash in file: $em"

# Check char count around 135000-137000 for any obvious break
Write-Host ""
Write-Host "=== Chars 135000-136700 bracket balance ==="
$slice = $c.Substring(135000, 1700)
$op = ($slice.ToCharArray() | Where-Object {$_ -eq '('}).Count
$cp = ($slice.ToCharArray() | Where-Object {$_ -eq ')'}).Count
$ob = ($slice.ToCharArray() | Where-Object {$_ -eq '{'}).Count
$cb = ($slice.ToCharArray() | Where-Object {$_ -eq '}'}).Count
$os = ($slice.ToCharArray() | Where-Object {$_ -eq '['}).Count
$cs = ($slice.ToCharArray() | Where-Object {$_ -eq ']'}).Count
Write-Host "( $op  ) $cp  diff=$($op-$cp)"
Write-Host "{ $ob  } $cb  diff=$($ob-$cb)"
Write-Host "[ $os  ] $cs  diff=$($os-$cs)"
