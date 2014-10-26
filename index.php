<?php
	define("VERSION", "v2.0 beta");
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>64k | MARS ATTACK <?php echo VERSION; ?></title>
		<link rel="stylesheet" href="./css/mars.css"/>
		<link href='http://fonts.googleapis.com/css?family=Press+Start+2P' rel='stylesheet' type='text/css'>
		<script src="./js/jquery.js"></script>
		<script src="./js/DOMready.js"></script>		
	</head>
	<body>		
		<div role="main" class="center-full-screen">
			<div id="title-screen">
				<div>
					<span style='color: red;'>MARS</span>
					<span style='color: green;'>ATTACK</span><small><?php echo VERSION; ?>
</small>				
				</div>
				<span class="blink">press X to start</span>				
				<div id="copyleft">
					<small>[SPACE] -> HIGH SCORES</small>
					<a href="#"><img src="./img/baobab.png" alt="Baobab"/></a><a href="#"><img src="./img/64k.png" alt="64k"/></a>
				</div>
			</div>	
			<div id="ranking"></div>
			<div id="game-screen">
				<div id="info"></div>			
				<div id="wave"></div>
				<div id="gameover" class="blink center-full-screen">GAME OVER</div>
				<div id="player-name" class="center-full-screen">
					YOU RANKED #<span id="youranked"></span><br/><input id='playerName' value='ENTER YOUR NAME'/>
				</div>
				<div id="debug">
					<label>--------- DEBUG ---------</label>
					<div id="fps">FPS:</div>
					<div id="setfps">SET FPS:</div>
					<div id="performance"></div>
					<div id="missiletrack"></div>
					<div id="firebehavior"></div>
					<div id="martiantrack"></div>
					<div id="egoclock"></div>
					<div id="egostate"></div>
					<div id="egodeltax"></div>
					<div id="egodeltay"></div>
					<label>-------------------------</label>
				</div>				
			</div>
		</div>
	</body>
</html>